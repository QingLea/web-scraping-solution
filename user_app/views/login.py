from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from rest_framework.response import Response
from rest_framework.views import APIView

from scraper.serializers import LoginSerializer


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": serializer.errors}, status=400)
        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"detail": f"{user.username} is logged in."}, status=200)
        else:
            return Response({"detail": "Invalid username or password."}, status=401)

    def delete(self, request):
        logout(request)
        return Response({"detail": "Logged out."}, status=200)
