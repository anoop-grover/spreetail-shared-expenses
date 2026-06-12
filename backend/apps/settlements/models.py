from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Settlement(models.Model):
    group = models.ForeignKey("groups.Group", related_name="settlements", on_delete=models.CASCADE)
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="settlements_paid", on_delete=models.PROTECT)
    paid_to = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="settlements_received", on_delete=models.PROTECT)
    currency = models.ForeignKey("groups.Currency", on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    settlement_date = models.DateTimeField(db_index=True)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_settlements")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-settlement_date", "-id"]

    def clean(self):
        if self.amount <= 0:
            raise ValidationError("Settlement amount must be positive")
        if self.paid_by_id == self.paid_to_id:
            raise ValidationError("Settlement payer and recipient must differ")
