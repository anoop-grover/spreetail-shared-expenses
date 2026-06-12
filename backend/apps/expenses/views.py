from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.models import write_audit

from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(deleted_at__isnull=True).select_related("group", "paid_by", "currency").prefetch_related("participants__user")

    def perform_create(self, serializer):
        expense = serializer.save()
        write_audit(self.request.user, "expense.created", expense, after=ExpenseSerializer(expense, context={"request": self.request}).data)

    def perform_update(self, serializer):
        before = ExpenseSerializer(self.get_object(), context={"request": self.request}).data
        expense = serializer.save()
        write_audit(self.request.user, "expense.updated", expense, before=before, after=ExpenseSerializer(expense, context={"request": self.request}).data)

    def destroy(self, request, *args, **kwargs):
        expense = self.get_object()
        before = ExpenseSerializer(expense, context={"request": request}).data
        expense.deleted_at = timezone.now()
        expense.save(update_fields=["deleted_at"])
        write_audit(request.user, "expense.deleted", expense, before=before, after={"deleted_at": expense.deleted_at.isoformat()})
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        expense = self.get_object()
        return Response(list(expense.history.values("action", "snapshot", "created_at", "actor_id")))
