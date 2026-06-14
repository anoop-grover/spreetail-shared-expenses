import traceback

from apps.groups.models import Group
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.models import write_audit

from .models import ImportSession
from .serializers import ImportReviewSerializer, ImportSessionSerializer, ImportUploadSerializer
from .services import CsvImportService


class ImportSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ImportSessionSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return ImportSession.objects.select_related("uploaded_by", "group").prefetch_related("anomalies")

    def create(self, request, *args, **kwargs):
        serializer = ImportUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = None
        if serializer.validated_data.get("group"):
            group = Group.objects.get(pk=serializer.validated_data["group"])
        session = CsvImportService().parse(file=serializer.validated_data["file"], uploaded_by=request.user, group=group)
        write_audit(request.user, "import.parsed", session, after=session.report)
        return Response(ImportSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    # @action(detail=True, methods=["post"])
    # def review(self, request, pk=None):
    #     session = self.get_object()
    #     serializer = ImportReviewSerializer(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     session = CsvImportService().apply_review_actions(session=session, actions=serializer.validated_data["actions"])
    #     write_audit(request.user, "import.reviewed", session, after=session.report)
    #     return Response(ImportSessionSerializer(session).data)

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        try:
            session = self.get_object()

            serializer = ImportReviewSerializer(
                data=request.data
            )

            serializer.is_valid(
                raise_exception=True
            )

            session = CsvImportService().apply_review_actions(
                session=session,
                actions=serializer.validated_data["actions"],
            )

            return Response(
                ImportSessionSerializer(session).data
            )

        except Exception as e:
            traceback.print_exc()

            return Response(
                {"error": str(e)},
                status=500,
            )   