from rest_framework import permissions, authentication
from rest_framework.response import Response
from rest_framework.views import APIView


class UserProfileView(APIView):
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email
        })
