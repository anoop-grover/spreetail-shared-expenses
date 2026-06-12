from rest_framework import serializers

from .models import Currency, Group, GroupMembership


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ["id", "code", "name", "symbol"]


class GroupMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = GroupMembership
        fields = ["id", "group", "user", "user_email", "user_name", "joined_at", "left_at", "created_at"]
        read_only_fields = ["created_at"]

    def validate(self, attrs):
        data = {
            "group": attrs.get("group", getattr(self.instance, "group", None)),
            "user": attrs.get("user", getattr(self.instance, "user", None)),
            "joined_at": attrs.get("joined_at", getattr(self.instance, "joined_at", None)),
            "left_at": attrs.get("left_at", getattr(self.instance, "left_at", None)),
        }
        instance = GroupMembership(**data)
        if self.instance:
            instance.pk = self.instance.pk
        instance.clean()
        return attrs


class GroupSerializer(serializers.ModelSerializer):
    memberships = GroupMembershipSerializer(many=True, read_only=True)
    default_currency_code = serializers.CharField(source="default_currency.code", read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "description", "default_currency", "default_currency_code", "created_by", "created_at", "updated_at", "memberships"]
        read_only_fields = ["created_by", "created_at", "updated_at"]
