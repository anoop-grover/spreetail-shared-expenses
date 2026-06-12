from rest_framework import serializers

from .models import ImportAnomaly, ImportSession


class ImportAnomalySerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportAnomaly
        fields = ["id", "row_number", "code", "severity", "message", "payload", "action_taken", "created_at"]


class ImportSessionSerializer(serializers.ModelSerializer):
    anomalies = ImportAnomalySerializer(many=True, read_only=True)

    class Meta:
        model = ImportSession
        fields = [
            "id", "group", "uploaded_by", "original_filename", "status", "raw_rows",
            "normalized_rows", "report", "started_at", "completed_at", "anomalies",
        ]
        read_only_fields = ["uploaded_by", "original_filename", "status", "raw_rows", "normalized_rows", "report", "started_at", "completed_at"]


class ImportUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    group = serializers.IntegerField(required=False)


class ReviewActionSerializer(serializers.Serializer):
    row_number = serializers.IntegerField(min_value=1)
    action = serializers.ChoiceField(choices=["import", "merge", "keep_both", "ignore"])


class ImportReviewSerializer(serializers.Serializer):
    actions = ReviewActionSerializer(many=True)
