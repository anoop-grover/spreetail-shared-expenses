from django.db.models import Count, Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.expenses.models import Expense
from apps.groups.models import Group
from apps.imports.models import ImportSession
from apps.settlements.models import Settlement


class ReportViewSet(viewsets.ViewSet):
    @action(detail=False, methods=["get"])
    def summary(self, request):
        return Response({
            "groups": Group.objects.count(),
            "expenses": Expense.objects.filter(deleted_at__isnull=True).count(),
            "total_expense_amount": Expense.objects.filter(deleted_at__isnull=True).aggregate(total=Sum("amount"))["total"] or 0,
            "settlements": Settlement.objects.count(),
            "imports": ImportSession.objects.count(),
        })

    @action(detail=False, methods=["get"], url_path="category-spend")
    def category_spend(self, request):
        rows = Expense.objects.filter(deleted_at__isnull=True).values("category").annotate(total=Sum("amount"), count=Count("id")).order_by("-total")
        return Response(list(rows))
