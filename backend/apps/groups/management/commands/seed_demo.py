from datetime import datetime

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.groups.models import Currency, Group, GroupMembership


class Command(BaseCommand):
    help = "Seed the flatmates, currencies, group, and membership timeline used in the assignment."

    def handle(self, *args, **options):
        inr, _ = Currency.objects.get_or_create(code="INR", defaults={"name": "Indian Rupee", "symbol": "₹"})
        Currency.objects.get_or_create(code="USD", defaults={"name": "US Dollar", "symbol": "$"})

        users = {}
        for name in ["Aisha", "Rohan", "Priya", "Meera", "Dev", "Sam"]:
            user, _ = get_user_model().objects.get_or_create(
                email=f"{name.lower()}@example.com",
                defaults={"full_name": name},
            )
            if not user.full_name:
                user.full_name = name
                user.save(update_fields=["full_name"])
            users[name] = user

        group, _ = Group.objects.get_or_create(
            name="Flatmates",
            defaults={"description": "Shared flat and trip expenses", "default_currency": inr, "created_by": users["Aisha"]},
        )
        feb_1 = aware("2026-02-01")
        mar_31 = aware("2026-03-31")
        apr_15 = aware("2026-04-15")

        for name in ["Aisha", "Rohan", "Priya", "Dev"]:
            upsert_membership(group, users[name], feb_1, None)
        upsert_membership(group, users["Meera"], feb_1, mar_31)
        upsert_membership(group, users["Sam"], apr_15, None)

        self.stdout.write(self.style.SUCCESS("Seeded assignment demo data."))


def aware(value):
    return timezone.make_aware(datetime.fromisoformat(value))


def upsert_membership(group, user, joined_at, left_at):
    membership = GroupMembership.objects.filter(group=group, user=user, joined_at=joined_at).first()
    if membership:
        membership.left_at = left_at
        membership.save(update_fields=["left_at"])
    else:
        GroupMembership.objects.create(group=group, user=user, joined_at=joined_at, left_at=left_at)
