from __future__ import annotations

from collections import Counter
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.utils import timezone


class AnomalyDetector:
    code = "base"

    def detect(self, rows, context):
        return []


class MissingFieldsDetector(AnomalyDetector):
    code = "missing_fields"

    def detect(self, rows, context):
        required = context["required_fields"]
        anomalies = []
        for row in rows:
            missing = [field for field in required if not row["data"].get(field)]
            if missing:
                anomalies.append(error(row, self.code, f"Missing required fields: {', '.join(missing)}", {"fields": missing}))
        return anomalies


class MissingParticipantsDetector(AnomalyDetector):
    code = "missing_participants"

    def detect(self, rows, context):
        anomalies = []
        participant_fields = ["participants", "split_with", "members", "participant_emails"]
        for row in rows:
            if not any(row["data"].get(field) for field in participant_fields):
                anomalies.append(error(row, self.code, "No participant/split-with column was found for this row", {"accepted_fields": participant_fields}))
        return anomalies


class DateDetector(AnomalyDetector):
    code = "invalid_dates"

    def detect(self, rows, context):
        anomalies = []
        for row in rows:
            value = row["data"].get("date")
            if not value:
                continue
            try:
                parsed = parse_date(value)
            except ValueError:
                anomalies.append(error(row, self.code, "Date is not in a supported format", {"value": value}))
                continue
            if parsed > timezone.now():
                anomalies.append(warn(row, "future_dates", "Expense date is in the future", {"value": value}))
        return anomalies


class AmountDetector(AnomalyDetector):
    code = "invalid_amounts"

    def detect(self, rows, context):
        anomalies = []
        for row in rows:
            value = row["data"].get("amount")
            if value in (None, ""):
                continue
            try:
                amount = Decimal(str(value))
            except InvalidOperation:
                anomalies.append(error(row, self.code, "Amount is not a valid decimal", {"value": value}))
                continue
            if amount < 0:
                anomalies.append(warn(row, "negative_values", "Amount is negative", {"value": value}))
            if amount == 0:
                anomalies.append(error(row, self.code, "Amount must be greater than zero", {"value": value}))
        return anomalies


class DuplicateExpenseDetector(AnomalyDetector):
    code = "duplicate_expenses"

    def detect(self, rows, context):
        keys = [duplicate_key(row["data"]) for row in rows]
        counts = Counter(keys)
        return [warn(row, self.code, "Potential duplicate expense", {"dedupe_key": duplicate_key(row["data"])}) for row in rows if counts[duplicate_key(row["data"])] > 1]


class ReferenceDetector(AnomalyDetector):
    code = "reference_validation"

    def detect(self, rows, context):
        anomalies = []
        known_users = context.get("known_user_identifiers", set())
        known_groups = context.get("known_group_identifiers", set())
        known_currencies = context.get("known_currencies", set())
        for row in rows:
            data = row["data"]
            paid_by = normalize_identifier(data.get("paid_by"))
            group = normalize_identifier(data.get("group"))
            currency = str(data.get("currency", "")).upper()
            if paid_by and paid_by not in known_users:
                anomalies.append(error(row, "unknown_users", "Paid-by user is unknown", {"user": data["paid_by"]}))
            if group and group not in known_groups:
                anomalies.append(error(row, "unknown_groups", "Group is unknown", {"group": data["group"]}))
            if currency and currency not in known_currencies:
                anomalies.append(warn(row, "currency_mismatches", "Currency is not registered", {"currency": data["currency"]}))
            if context.get("default_currency_by_group", {}).get(group) and currency and currency != context["default_currency_by_group"][group] and not data.get("exchange_rate_to_group"):
                anomalies.append(error(row, "missing_exchange_rate", "Foreign-currency row requires exchange_rate_to_group", {"group": data.get("group"), "currency": currency}))
        return anomalies


class MembershipViolationDetector(AnomalyDetector):
    code = "membership_violations"

    def detect(self, rows, context):
        anomalies = []
        memberships = context.get("memberships_by_group_user", {})
        for row in rows:
            data = row["data"]
            date_value = data.get("date")
            paid_by = normalize_identifier(data.get("paid_by"))
            group = normalize_identifier(data.get("group"))
            if not date_value or not paid_by or not group:
                continue
            try:
                at = parse_date(date_value)
            except ValueError:
                continue
            periods = memberships.get((group, paid_by), [])
            active = any(joined_at <= at and (left_at is None or at < left_at) for joined_at, left_at in periods)
            if periods and not active:
                anomalies.append(error(row, self.code, "User exists but was not a group member on the transaction date", {"group": group, "user": paid_by, "date": date_value}))
        return anomalies


class SplitAndSettlementDetector(AnomalyDetector):
    code = "split_and_settlement"

    def detect(self, rows, context):
        anomalies = []
        for row in rows:
            data = row["data"]
            if "settlement" in str(data.get("category", "")).lower() or "paid back" in str(data.get("description", "")).lower():
                anomalies.append(warn(row, "settlement_as_expense", "Row may represent a settlement rather than an expense", data))
            try:
                if data.get("split_total") and data.get("amount") and Decimal(str(data["split_total"])) != Decimal(str(data["amount"])):
                    anomalies.append(error(row, "invalid_split_totals", "Split total does not equal amount", {"split_total": data["split_total"], "amount": data["amount"]}))
            except InvalidOperation:
                anomalies.append(error(row, "invalid_split_totals", "Split total or amount is not a valid decimal", {"split_total": data.get("split_total"), "amount": data.get("amount")}))
        return anomalies


def duplicate_key(data):
    return "|".join(str(data.get(key, "")).strip().lower() for key in ["date", "amount", "paid_by", "description", "group"])


def normalize_identifier(value):
    return str(value or "").strip().lower()


def parse_date(value):
    raw = str(value).strip()
    formats = ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%d %b %Y", "%b %d, %Y", "%Y/%m/%d"]
    try:
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        parsed = None
    if parsed is None:
        for fmt in formats:
            try:
                parsed = datetime.strptime(raw, fmt)
                break
            except ValueError:
                continue
    if parsed is None:
        raise ValueError("Unsupported date format")
    if timezone.is_naive(parsed):
        return timezone.make_aware(parsed)
    return parsed


def error(row, code, message, payload):
    return {"row_number": row["row_number"], "code": code, "severity": "error", "message": message, "payload": payload}


def warn(row, code, message, payload):
    return {"row_number": row["row_number"], "code": code, "severity": "warning", "message": message, "payload": payload}
