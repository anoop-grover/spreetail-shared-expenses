from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from apps.accounts.views import AuthViewSet, UserViewSet
from apps.audit.views import AuditLogViewSet
from apps.expenses.views import ExpenseViewSet
from apps.groups.views import CurrencyViewSet, GroupViewSet, MembershipViewSet
from apps.imports.views import ImportSessionViewSet
from apps.reports.views import ReportViewSet
from apps.settlements.views import SettlementViewSet

router = DefaultRouter()
router.register("auth", AuthViewSet, basename="auth")
router.register("users", UserViewSet, basename="users")
router.register("groups", GroupViewSet, basename="groups")
router.register("currencies", CurrencyViewSet, basename="currencies")
router.register("memberships", MembershipViewSet, basename="memberships")
router.register("expenses", ExpenseViewSet, basename="expenses")
router.register("settlements", SettlementViewSet, basename="settlements")
router.register("imports", ImportSessionViewSet, basename="imports")
router.register("audit-logs", AuditLogViewSet, basename="audit-logs")
router.register("reports", ReportViewSet, basename="reports")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/", include(router.urls)),
]
