from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ("groups", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="ImportSession",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("original_filename", models.CharField(max_length=255)),
                ("status", models.CharField(choices=[("parsed", "Parsed"), ("reviewed", "Reviewed"), ("imported", "Imported"), ("failed", "Failed")], default="parsed", max_length=20)),
                ("raw_rows", models.JSONField(default=list)),
                ("normalized_rows", models.JSONField(default=list)),
                ("report", models.JSONField(default=dict)),
                ("started_at", models.DateTimeField(auto_now_add=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("group", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="groups.group")),
                ("uploaded_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-started_at"]},
        ),
        migrations.CreateModel(
            name="ImportAnomaly",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("row_number", models.PositiveIntegerField(blank=True, null=True)),
                ("code", models.CharField(max_length=80)),
                ("severity", models.CharField(choices=[("info", "Info"), ("warning", "Warning"), ("error", "Error")], max_length=20)),
                ("message", models.TextField()),
                ("payload", models.JSONField(default=dict)),
                ("action_taken", models.CharField(blank=True, max_length=40)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("session", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="anomalies", to="imports.importsession")),
            ],
        ),
    ]
