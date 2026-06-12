import csv
import io
import time
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from apps.expenses.models import Expense, ExpenseHistory, ExpenseParticipant
from apps.groups.models import Currency, Group, GroupMembership

from .anomalies import AmountDetector, DateDetector, DuplicateExpenseDetector, MembershipViolationDetector, MissingFieldsDetector, MissingParticipantsDetector, ReferenceDetector, SplitAndSettlementDetector, normalize_identifier, parse_date
from .models import ImportAnomaly, ImportSession

User = get_user_model()

DETECTORS = [
    MissingFieldsDetector(),
    MissingParticipantsDetector(),
    DateDetector(),
    AmountDetector(),
    DuplicateExpenseDetector(),
    ReferenceDetector(),
    MembershipViolationDetector(),
    SplitAndSettlementDetector(),
]


class CsvImportService:
    required_fields = ["date", "amount", "paid_by", "description", "group", "currency"]

    def parse(self, *, file, uploaded_by, group=None):
        started = time.monotonic()
        text = file.read().decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        rows = [{"row_number": index, "data": self.normalize_row(row)} for index, row in enumerate(reader, start=2)]
        session = ImportSession.objects.create(
            group=group,
            uploaded_by=uploaded_by,
            original_filename=getattr(file, "name", "upload.csv"),
            raw_rows=[row["data"] for row in rows],
            normalized_rows=rows,
        )
        context = self.context()
        anomalies = []
        for detector in DETECTORS:
            anomalies.extend(detector.detect(rows, context))
        ImportAnomaly.objects.bulk_create([ImportAnomaly(session=session, **item) for item in anomalies])
        session.report = {
            "rows_processed": len(rows),
            "rows_imported": 0,
            "rows_skipped": len([a for a in anomalies if a["severity"] == "error"]),
            "anomalies_found": len(anomalies),
            "actions_taken": [],
            "import_duration_ms": round((time.monotonic() - started) * 1000),
            "import_timestamp": timezone.now().isoformat(),
        }
        session.save(update_fields=["report"])
        return session

    @transaction.atomic
    def apply_review_actions(self, *, session, actions):
        actions_by_row = {int(item["row_number"]): item["action"] for item in actions}
        error_rows = set(session.anomalies.filter(severity="error").values_list("row_number", flat=True))
        imported = skipped = 0
        imported_expense_ids = []
        action_log = []
        for anomaly in session.anomalies.all():
            if anomaly.row_number in actions_by_row:
                anomaly.action_taken = actions_by_row[anomaly.row_number]
                anomaly.save(update_fields=["action_taken"])
        for row in session.normalized_rows:
            row_number = row["row_number"]
            action = actions_by_row.get(row_number, "ignore" if row_number in error_rows else "import")
            action_log.append({"row_number": row_number, "action": action})
            if action in {"ignore", "merge"}:
                skipped += 1
            else:
                expense = self.create_expense_from_row(row["data"], session.uploaded_by)
                imported_expense_ids.append(expense.id)
                imported += 1
        session.status = ImportSession.Status.IMPORTED
        session.completed_at = timezone.now()
        session.report = {
            **session.report,
            "rows_imported": imported,
            "rows_skipped": skipped,
            "actions_taken": action_log,
            "imported_expense_ids": imported_expense_ids,
            "import_duration_ms": session.report.get("import_duration_ms", 0),
            "import_timestamp": timezone.now().isoformat(),
        }
        session.save(update_fields=["status", "completed_at", "report"])
        return session

    def create_expense_from_row(self, data, actor):
        group = self.resolve_group(data["group"])
        paid_by = self.resolve_user(data["paid_by"])
        currency = Currency.objects.get(code=str(data["currency"]).upper())
        amount = Decimal(str(data["amount"]))
        exchange_rate = Decimal(str(data.get("exchange_rate_to_group") or "1.000000"))
        expense = Expense.objects.create(
            group=group,
            paid_by=paid_by,
            currency=currency,
            amount=amount,
            exchange_rate_to_group=exchange_rate,
            description=data["description"],
            category=data.get("category", ""),
            notes=data.get("notes", ""),
            split_type=self.normalize_split_type(data.get("split_type") or data.get("split") or "equal"),
            expense_date=parse_date(data["date"]),
            created_by=actor,
        )
        participants = self.resolve_participants(data)
        self.create_participants(expense, participants, data)
        ExpenseHistory.objects.create(expense=expense, actor=actor, action="imported", snapshot={"source": "csv", "row": data})
        return expense

    def create_participants(self, expense, participants, data):
        if not participants:
            raise ValueError("Cannot import expense without participants")
        split_type = expense.split_type
        if split_type == Expense.SplitType.EQUAL:
            share = (expense.amount / Decimal(len(participants))).quantize(Decimal("0.01"))
            running = Decimal("0.00")
            for index, user in enumerate(participants):
                amount = expense.amount - running if index == len(participants) - 1 else share
                running += amount
                ExpenseParticipant.objects.create(expense=expense, user=user, share_amount=amount)
            return
        if split_type == Expense.SplitType.EXACT:
            shares = self.parse_decimal_map(data.get("shares") or data.get("split_amounts"))
            for user in participants:
                ExpenseParticipant.objects.create(expense=expense, user=user, share_amount=self.decimal_for_user(shares, user))
            return
        percentages = self.parse_decimal_map(data.get("percentages") or data.get("split_percentages"))
        for user in participants:
            pct = self.decimal_for_user(percentages, user)
            share = (expense.amount * pct / Decimal("100")).quantize(Decimal("0.01"))
            ExpenseParticipant.objects.create(expense=expense, user=user, share_amount=share, percentage=pct)

    def normalize_row(self, row):
        lowered = {str(key).strip().lower().replace(" ", "_"): value.strip() if isinstance(value, str) else value for key, value in row.items()}
        aliases = {
            "expense_date": "date",
            "paid_by_email": "paid_by",
            "group_name": "group",
            "total": "amount",
            "memo": "description",
        }
        for source, target in aliases.items():
            if source in lowered and target not in lowered:
                lowered[target] = lowered[source]
        return lowered

    def context(self):
        memberships = {}
        for membership in GroupMembership.objects.select_related("group", "user"):
            user_keys = [normalize_identifier(membership.user.email), normalize_identifier(membership.user.full_name)]
            for user_key in user_keys:
                if user_key:
                    memberships.setdefault((normalize_identifier(membership.group.name), user_key), []).append((membership.joined_at, membership.left_at))
        groups = list(Group.objects.select_related("default_currency"))
        return {
            "required_fields": self.required_fields,
            "known_user_identifiers": set(filter(None, [normalize_identifier(value) for value in User.objects.values_list("email", flat=True)] + [normalize_identifier(value) for value in User.objects.values_list("full_name", flat=True)])),
            "known_group_identifiers": set(normalize_identifier(group.name) for group in groups),
            "known_currencies": set(Currency.objects.values_list("code", flat=True)),
            "default_currency_by_group": {normalize_identifier(group.name): group.default_currency.code for group in groups},
            "memberships_by_group_user": memberships,
            "now": datetime.utcnow(),
        }

    def resolve_user(self, identifier):
        normalized = normalize_identifier(identifier)
        user = User.objects.filter(email__iexact=normalized).first() or User.objects.filter(full_name__iexact=str(identifier).strip()).first()
        if not user:
            raise ValueError(f"Unknown user: {identifier}")
        return user

    def resolve_group(self, identifier):
        group = Group.objects.filter(name__iexact=str(identifier).strip()).first()
        if not group:
            raise ValueError(f"Unknown group: {identifier}")
        return group

    def resolve_participants(self, data):
        raw = data.get("participants") or data.get("split_with") or data.get("members") or data.get("participant_emails") or ""
        tokens = [token.strip() for token in str(raw).replace(";", ",").split(",") if token.strip()]
        return [self.resolve_user(token) for token in tokens]

    def normalize_split_type(self, value):
        normalized = normalize_identifier(value).replace(" ", "_")
        mapping = {"equal": Expense.SplitType.EQUAL, "exact": Expense.SplitType.EXACT, "exact_amount": Expense.SplitType.EXACT, "percentage": Expense.SplitType.PERCENTAGE, "percent": Expense.SplitType.PERCENTAGE}
        if normalized not in mapping:
            raise ValueError(f"Unsupported split type: {value}")
        return mapping[normalized]

    def parse_decimal_map(self, raw):
        result = {}
        for item in str(raw or "").replace(";", ",").split(","):
            if not item.strip():
                continue
            if ":" not in item:
                raise ValueError(f"Invalid split map item: {item}")
            key, value = item.split(":", 1)
            try:
                result[normalize_identifier(key)] = Decimal(value.strip())
            except InvalidOperation as exc:
                raise ValueError(f"Invalid split value for {key}") from exc
        return result

    def decimal_for_user(self, values, user):
        for key in [normalize_identifier(user.email), normalize_identifier(user.full_name)]:
            if key in values:
                return values[key]
        raise ValueError(f"Missing split value for {user.email}")
