from rest_framework import serializers

from apps.groups.models import GroupMembership

from .models import Settlement


class SettlementSerializer(serializers.ModelSerializer):
    paid_by_email = serializers.EmailField(source="paid_by.email", read_only=True)
    paid_to_email = serializers.EmailField(source="paid_to.email", read_only=True)

    class Meta:
        model = Settlement
        fields = ["id", "group", "paid_by", "paid_by_email", "paid_to", "paid_to_email", "currency", "amount", "settlement_date", "note", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]

    def validate(self, attrs):
        group = attrs.get("group", getattr(self.instance, "group", None))
        paid_by = attrs.get("paid_by", getattr(self.instance, "paid_by", None))
        paid_to = attrs.get("paid_to", getattr(self.instance, "paid_to", None))
        at = attrs.get("settlement_date", getattr(self.instance, "settlement_date", None))
        if attrs.get("amount", getattr(self.instance, "amount", 1)) <= 0:
            raise serializers.ValidationError("Settlement amount must be positive")
        if paid_by == paid_to:
            raise serializers.ValidationError("Settlement payer and recipient must differ")
        for user in [paid_by, paid_to]:
            if not is_member(group, user, at):
                raise serializers.ValidationError(f"{user.email} was not a member on the settlement date")
        return attrs


def is_member(group, user, at):
    from django.db.models import Q

    return GroupMembership.objects.filter(group=group, user=user, joined_at__lte=at).filter(Q(left_at__isnull=True) | Q(left_at__gt=at)).exists()
