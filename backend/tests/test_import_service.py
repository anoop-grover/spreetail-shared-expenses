from io import BytesIO
from datetime import timezone as dt_timezone

import pytest

from apps.accounts.models import User
from apps.groups.models import Currency, Group
from apps.groups.models import GroupMembership
from apps.expenses.models import Expense
from apps.imports.services import CsvImportService
from django.utils import timezone


class Upload(BytesIO):
    name = "expenses.csv"


@pytest.mark.django_db
def test_csv_import_detects_generic_anomalies():
    user = User.objects.create_user(email="known@example.com", password="password123")
    Currency.objects.create(code="USD", name="US Dollar", symbol="$")
    Group.objects.create(name="Known Group", default_currency=Currency.objects.get(code="USD"), created_by=user)
    data = b"date,amount,paid_by,description,group,currency\nnot-a-date,-12,unknown@example.com,Dinner,Missing Group,EUR\n"

    session = CsvImportService().parse(file=Upload(data), uploaded_by=user)

    codes = set(session.anomalies.values_list("code", flat=True))
    assert {"invalid_dates", "negative_values", "unknown_users", "unknown_groups", "currency_mismatches"}.issubset(codes)
    assert session.report["rows_processed"] == 1
    assert session.report["anomalies_found"] >= 5


@pytest.mark.django_db
def test_csv_import_creates_expenses_for_reviewed_rows():
    aisha = User.objects.create_user(email="aisha@example.com", password="password123", full_name="Aisha")
    rohan = User.objects.create_user(email="rohan@example.com", password="password123", full_name="Rohan")
    currency = Currency.objects.create(code="INR", name="Indian Rupee", symbol="₹")
    group = Group.objects.create(name="Flatmates", default_currency=currency, created_by=aisha)
    joined_at = timezone.datetime(2026, 2, 1, tzinfo=dt_timezone.utc)
    GroupMembership.objects.create(group=group, user=aisha, joined_at=joined_at)
    GroupMembership.objects.create(group=group, user=rohan, joined_at=joined_at)
    data = b"date,amount,paid_by,description,group,currency,participants,split_type\n2026-02-10,100,Aisha,Groceries,Flatmates,INR,Aisha;Rohan,equal\n"

    session = CsvImportService().parse(file=Upload(data), uploaded_by=aisha)
    CsvImportService().apply_review_actions(session=session, actions=[{"row_number": 2, "action": "import"}])

    expense = Expense.objects.get(description="Groceries")
    assert expense.participants.count() == 2
    assert session.report["rows_imported"] == 1
