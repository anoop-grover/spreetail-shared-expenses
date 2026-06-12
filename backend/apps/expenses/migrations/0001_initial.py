from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("groups", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="Expense",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("description", models.CharField(max_length=255)),
                ("category", models.CharField(blank=True, max_length=80)),
                ("notes", models.TextField(blank=True)),
                ("split_type", models.CharField(choices=[("equal", "Equal"), ("exact", "Exact Amount"), ("percentage", "Percentage")], max_length=20)),
                ("expense_date", models.DateTimeField(db_index=True)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="created_expenses", to=settings.AUTH_USER_MODEL)),
                ("currency", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to="groups.currency")),
                ("exchange_rate_to_group", models.DecimalField(decimal_places=6, default="1.000000", max_digits=12)),
                ("group", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="expenses", to="groups.group")),
                ("paid_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="paid_expenses", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-expense_date", "-id"]},
        ),
        migrations.CreateModel(
            name="ExpenseHistory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(max_length=40)),
                ("snapshot", models.JSONField(default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("actor", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ("expense", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="history", to="expenses.expense")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="ExpenseParticipant",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("share_amount", models.DecimalField(decimal_places=2, default="0.00", max_digits=12)),
                ("percentage", models.DecimalField(blank=True, decimal_places=4, max_digits=7, null=True)),
                ("expense", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="participants", to="expenses.expense")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
            options={"unique_together": {("expense", "user")}},
        ),
    ]
