from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("groups", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="Settlement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("settlement_date", models.DateTimeField(db_index=True)),
                ("note", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="created_settlements", to=settings.AUTH_USER_MODEL)),
                ("currency", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to="groups.currency")),
                ("group", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="settlements", to="groups.group")),
                ("paid_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="settlements_paid", to=settings.AUTH_USER_MODEL)),
                ("paid_to", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="settlements_received", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-settlement_date", "-id"]},
        )
    ]
