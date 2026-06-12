from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class Currency(models.Model):
    code = models.CharField(max_length=3, unique=True)
    name = models.CharField(max_length=80)
    symbol = models.CharField(max_length=8, blank=True)

    class Meta:
        ordering = ["code"]

    def __str__(self) -> str:
        return self.code


class Group(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    default_currency = models.ForeignKey(Currency, on_delete=models.PROTECT)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_groups")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class GroupMembership(models.Model):
    group = models.ForeignKey(Group, related_name="memberships", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="group_memberships", on_delete=models.CASCADE)
    joined_at = models.DateTimeField()
    left_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["group_id", "joined_at"]
        constraints = [
            models.CheckConstraint(check=Q(left_at__isnull=True) | Q(left_at__gt=models.F("joined_at")), name="membership_left_after_joined")
        ]

    def clean(self):
        if self.left_at and self.left_at <= self.joined_at:
            raise ValidationError("left_at must be after joined_at")
        qs = GroupMembership.objects.filter(group=self.group, user=self.user)
        if self.pk:
            qs = qs.exclude(pk=self.pk)
        starts_before_existing_end = Q(left_at__isnull=True) | Q(left_at__gt=self.joined_at)
        if self.left_at:
            overlap = qs.filter(joined_at__lt=self.left_at).filter(starts_before_existing_end)
        else:
            overlap = qs.filter(starts_before_existing_end)
        if overlap.exists():
            raise ValidationError("Membership periods for the same user and group cannot overlap")

    def is_active_on(self, at):
        return self.joined_at <= at and (self.left_at is None or at < self.left_at)
