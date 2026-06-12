from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Expense(models.Model):
    class SplitType(models.TextChoices):
        EQUAL = "equal", "Equal"
        EXACT = "exact", "Exact Amount"
        PERCENTAGE = "percentage", "Percentage"

    group = models.ForeignKey("groups.Group", related_name="expenses", on_delete=models.CASCADE)
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="paid_expenses", on_delete=models.PROTECT)
    currency = models.ForeignKey("groups.Currency", on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    exchange_rate_to_group = models.DecimalField(max_digits=12, decimal_places=6, default=Decimal("1.000000"))
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=80, blank=True)
    notes = models.TextField(blank=True)
    split_type = models.CharField(max_length=20, choices=SplitType.choices)
    expense_date = models.DateTimeField(db_index=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_expenses")
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-expense_date", "-id"]

    def clean(self):
        if self.amount <= 0:
            raise ValidationError("Expense amount must be positive")
        if self.exchange_rate_to_group <= 0:
            raise ValidationError("Exchange rate must be positive")

    @property
    def amount_in_group_currency(self):
        return (self.amount * self.exchange_rate_to_group).quantize(Decimal("0.01"))


class ExpenseParticipant(models.Model):
    expense = models.ForeignKey(Expense, related_name="participants", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    share_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    percentage = models.DecimalField(max_digits=7, decimal_places=4, null=True, blank=True)

    @property
    def share_amount_in_group_currency(self):
        return (self.share_amount * self.expense.exchange_rate_to_group).quantize(Decimal("0.01"))

    class Meta:
        unique_together = ["expense", "user"]


class ExpenseHistory(models.Model):
    expense = models.ForeignKey(Expense, related_name="history", on_delete=models.CASCADE)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=40)
    snapshot = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
