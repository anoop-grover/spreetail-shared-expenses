from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.groups.models import GroupMembership

from .models import Expense, ExpenseHistory, ExpenseParticipant


class ExpenseParticipantSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ExpenseParticipant
        fields = ["id", "user", "user_email", "share_amount", "percentage"]


class ExpenseSerializer(serializers.ModelSerializer):
    participants = ExpenseParticipantSerializer(many=True)

    class Meta:
        model = Expense
        fields = [
            "id", "group", "paid_by", "currency", "amount", "exchange_rate_to_group", "description", "category", "notes",
            "split_type", "expense_date", "created_by", "deleted_at", "created_at", "updated_at", "participants",
        ]
        read_only_fields = ["created_by", "deleted_at", "created_at", "updated_at"]

    def validate(self, attrs):
        participants = attrs.get("participants", [])
        split_type = attrs.get("split_type", getattr(self.instance, "split_type", None))
        amount = attrs.get("amount", getattr(self.instance, "amount", None))
        expense_date = attrs.get("expense_date", getattr(self.instance, "expense_date", None))
        group = attrs.get("group", getattr(self.instance, "group", None))
        paid_by = attrs.get("paid_by", getattr(self.instance, "paid_by", None))
        currency = attrs.get("currency", getattr(self.instance, "currency", None))
        exchange_rate = attrs.get("exchange_rate_to_group", getattr(self.instance, "exchange_rate_to_group", Decimal("1.000000")))
        if not participants:
            raise serializers.ValidationError("At least one participant is required")
        if amount is not None and amount <= 0:
            raise serializers.ValidationError("Expense amount must be positive")
        if exchange_rate <= 0:
            raise serializers.ValidationError("Exchange rate must be positive")
        if group and currency and currency_id(currency) != group.default_currency_id and exchange_rate == Decimal("1.000000"):
            raise serializers.ValidationError("Non-default currency expenses require an explicit exchange rate")
        if group and paid_by and expense_date and not is_member(group, paid_by, expense_date):
            raise serializers.ValidationError("Payer was not a member on the expense date")
        for participant in participants:
            user = participant["user"]
            if not is_member(group, user, expense_date):
                raise serializers.ValidationError(f"{user.email} was not a member on the expense date")
        if split_type == Expense.SplitType.EXACT:
            total = sum((p.get("share_amount") or Decimal("0")) for p in participants)
            if total != amount:
                raise serializers.ValidationError("Exact split shares must equal expense amount")
        if split_type == Expense.SplitType.PERCENTAGE:
            total_pct = sum((p.get("percentage") or Decimal("0")) for p in participants)
            if total_pct != Decimal("100.0000"):
                raise serializers.ValidationError("Percentage splits must total 100")
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        participants = validated_data.pop("participants")
        expense = Expense.objects.create(created_by=self.context["request"].user, **validated_data)
        self._save_participants(expense, participants)
        ExpenseHistory.objects.create(expense=expense, actor=self.context["request"].user, action="created", snapshot=ExpenseSerializer(expense).data)
        return expense

    @transaction.atomic
    def update(self, instance, validated_data):
        participants = validated_data.pop("participants", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        if participants is not None:
            instance.participants.all().delete()
            self._save_participants(instance, participants)
        ExpenseHistory.objects.create(expense=instance, actor=self.context["request"].user, action="updated", snapshot=ExpenseSerializer(instance).data)
        return instance

    def _save_participants(self, expense, participants):
        if expense.split_type == Expense.SplitType.EQUAL:
            share = (expense.amount / Decimal(len(participants))).quantize(Decimal("0.01"))
            running = Decimal("0.00")
            for index, participant in enumerate(participants):
                amount = expense.amount - running if index == len(participants) - 1 else share
                running += amount
                ExpenseParticipant.objects.create(expense=expense, user=participant["user"], share_amount=amount)
            return
        for participant in participants:
            share = participant.get("share_amount") or (expense.amount * participant["percentage"] / Decimal("100")).quantize(Decimal("0.01"))
            ExpenseParticipant.objects.create(expense=expense, user=participant["user"], share_amount=share, percentage=participant.get("percentage"))


def is_member(group, user, at):
    from django.db.models import Q

    return GroupMembership.objects.filter(group=group, user=user, joined_at__lte=at).filter(Q(left_at__isnull=True) | Q(left_at__gt=at)).exists()


def currency_id(currency):
    return getattr(currency, "id", currency)
