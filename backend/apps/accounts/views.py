from django.contrib.auth import get_user_model
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, token_payload

User = get_user_model()


class AuthViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == "register":
            return RegisterSerializer
        if self.action == "login":
            return LoginSerializer
        return RegisterSerializer

    @action(detail=False, methods=["post"])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(token_payload(serializer.validated_data["user"]))

    @action(detail=False, methods=["post"], url_path="google")
    def google(self, request):
        email = request.data.get("email")
        google_sub = request.data.get("google_sub")
        if not email or not google_sub:
            return Response({"detail": "email and google_sub are required"}, status=status.HTTP_400_BAD_REQUEST)
        user, _ = User.objects.get_or_create(
            email=email.lower(),
            defaults={"full_name": request.data.get("full_name", ""), "google_sub": google_sub},
        )
        if not user.google_sub:
            user.google_sub = google_sub
            user.save(update_fields=["google_sub"])
        return Response(token_payload(user))


class UserViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.order_by("email")

    @action(detail=False, methods=["get"])
    def me(self, request):
        return Response(self.get_serializer(request.user).data)
