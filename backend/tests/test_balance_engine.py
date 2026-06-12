from decimal import Decimal

import pytest
from django.utils import timezone

from apps.accounts.models import User
from apps.expenses.models import Expense, ExpenseParticipant
from apps.expenses.services.balance_engine import BalanceEngine
from apps.groups.models import Currency, Group, GroupMembership
from apps.settlements.models import Settlement


@pytest.mark.django_db
def test_balance_engine_tracks_expenses_and_settlements():
    currency = Currency.objects.create(code="USD", name="US Dollar", symbol="$")
    alice = User.objects.create_user(email="alice@example.com", password="password123")
    bob = User.objects.create_user(email="bob@example.com", password="password123")
    group = Group.objects.create(name="Trip", default_currency=currency, created_by=alice)
    now = timezone.now()
    GroupMembership.objects.create(group=group, user=alice, joined_at=now)
    GroupMembership.objects.create(group=group, user=bob, joined_at=now)
    expense = Expense.objects.create(group=group, paid_by=alice, currency=currency, amount=Decimal("100.00"), description="Hotel", split_type="equal", expense_date=now, created_by=alice)
    ExpenseParticipant.objects.create(expense=expense, user=alice, share_amount=Decimal("50.00"))
    ExpenseParticipant.objects.create(expense=expense, user=bob, share_amount=Decimal("50.00"))
    Settlement.objects.create(group=group, paid_by=bob, paid_to=alice, currency=currency, amount=Decimal("20.00"), settlement_date=now, created_by=bob)

    result = BalanceEngine(group).calculate()

    assert {"user_id": alice.id, "net": "30.00"} in result["balances"]
    assert {"user_id": bob.id, "net": "-30.00"} in result["balances"]
    assert len(result["trace"]) == 4


@pytest.mark.django_db
def test_debt_simplification_outputs_who_owes_whom():
    currency = Currency.objects.create(code="USD", name="US Dollar", symbol="$")
    alice = User.objects.create_user(email="alice2@example.com", password="password123")
    bob = User.objects.create_user(email="bob2@example.com", password="password123")
    group = Group.objects.create(name="Flat", default_currency=currency, created_by=alice)
    now = timezone.now()
    Expense.objects.create(group=group, paid_by=alice, currency=currency, amount=Decimal("40.00"), description="Supplies", split_type="exact", expense_date=now, created_by=alice)
    expense = Expense.objects.first()
    ExpenseParticipant.objects.create(expense=expense, user=bob, share_amount=Decimal("40.00"))

    result = BalanceEngine(group).simplify_debts()

    assert result["transfers"] == [{"from_user_id": bob.id, "to_user_id": alice.id, "amount": "40.00"}]


@pytest.mark.django_db
def test_balance_engine_converts_foreign_currency_to_group_currency():
    inr = Currency.objects.create(code="INR", name="Indian Rupee", symbol="₹")
    usd = Currency.objects.create(code="USD", name="US Dollar", symbol="$")
    priya = User.objects.create_user(email="priya@example.com", password="password123")
    dev = User.objects.create_user(email="dev@example.com", password="password123")
    group = Group.objects.create(name="Trip", default_currency=inr, created_by=priya)
    now = timezone.now()
    GroupMembership.objects.create(group=group, user=priya, joined_at=now)
    GroupMembership.objects.create(group=group, user=dev, joined_at=now)
    expense = Expense.objects.create(
        group=group,
        paid_by=priya,
        currency=usd,
        amount=Decimal("10.00"),
        exchange_rate_to_group=Decimal("83.000000"),
        description="Taxi",
        split_type="equal",
        expense_date=now,
        created_by=priya,
    )
    ExpenseParticipant.objects.create(expense=expense, user=priya, share_amount=Decimal("5.00"))
    ExpenseParticipant.objects.create(expense=expense, user=dev, share_amount=Decimal("5.00"))

    result = BalanceEngine(group).calculate()

    assert {"user_id": priya.id, "net": "415.00"} in result["balances"]
    assert {"user_id": dev.id, "net": "-415.00"} in result["balances"]
    assert result["trace"][0]["source_currency"] == "USD"
