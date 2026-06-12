from rest_framework import viewsets

from apps.audit.models import write_audit

from .models import Settlement
from .serializers import SettlementSerializer


class SettlementViewSet(viewsets.ModelViewSet):
    serializer_class = SettlementSerializer

    def get_queryset(self):
        return Settlement.objects.select_related("group", "paid_by", "paid_to", "currency")

    def perform_create(self, serializer):
        settlement = serializer.save(created_by=self.request.user)
        write_audit(self.request.user, "settlement.created", settlement, after=SettlementSerializer(settlement).data)
