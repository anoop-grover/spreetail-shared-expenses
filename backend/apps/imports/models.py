from django.conf import settings
from django.db import models


class ImportSession(models.Model):
    class Status(models.TextChoices):
        PARSED = "parsed", "Parsed"
        REVIEWED = "reviewed", "Reviewed"
        IMPORTED = "imported", "Imported"
        FAILED = "failed", "Failed"

    group = models.ForeignKey("groups.Group", null=True, blank=True, on_delete=models.SET_NULL)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    original_filename = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PARSED)
    raw_rows = models.JSONField(default=list)
    normalized_rows = models.JSONField(default=list)
    report = models.JSONField(default=dict)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]


class ImportAnomaly(models.Model):
    class Severity(models.TextChoices):
        INFO = "info", "Info"
        WARNING = "warning", "Warning"
        ERROR = "error", "Error"

    session = models.ForeignKey(ImportSession, related_name="anomalies", on_delete=models.CASCADE)
    row_number = models.PositiveIntegerField(null=True, blank=True)
    code = models.CharField(max_length=80)
    severity = models.CharField(max_length=20, choices=Severity.choices)
    message = models.TextField()
    payload = models.JSONField(default=dict)
    action_taken = models.CharField(max_length=40, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
