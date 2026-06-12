from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.models import write_audit
from apps.expenses.services.balance_engine import BalanceEngine

from .models import Currency, Group, GroupMembership
from .serializers import CurrencySerializer, GroupMembershipSerializer, GroupSerializer


class CurrencyViewSet(viewsets.ModelViewSet):
    serializer_class = CurrencySerializer
    queryset = Currency.objects.all()


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer

    def get_queryset(self):
        return Group.objects.select_related("default_currency", "created_by").prefetch_related("memberships__user")

    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)
        GroupMembership.objects.create(group=group, user=self.request.user, joined_at=timezone.now())
        write_audit(self.request.user, "group.created", group, after=GroupSerializer(group).data)

    @action(detail=True, methods=["get"])
    def balances(self, request, pk=None):
        return Response(BalanceEngine(self.get_object()).calculate())

    @action(detail=True, methods=["get"], url_path="simplified-debts")
    def simplified_debts(self, request, pk=None):
        return Response(BalanceEngine(self.get_object()).simplify_debts())


class MembershipViewSet(viewsets.ModelViewSet):
    serializer_class = GroupMembershipSerializer

    def get_queryset(self):
        return GroupMembership.objects.select_related("group", "user")

    def perform_create(self, serializer):
        membership = serializer.save()
        write_audit(self.request.user, "membership.created", membership, after=GroupMembershipSerializer(membership).data)

    def perform_update(self, serializer):
        before = GroupMembershipSerializer(self.get_object()).data
        membership = serializer.save()
        write_audit(self.request.user, "membership.updated", membership, before=before, after=GroupMembershipSerializer(membership).data)
