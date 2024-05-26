from django.contrib.auth import logout
from rest_framework import permissions, authentication
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from user_app.serializers import UpdateAccountSerializer

class UpdateAccountView(APIView):
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        """
        Update the password of the current user.
        """
        serializer = UpdateAccountSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"detail": f"Invalid input: {serializer.errors}."}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        # Corrected method call
        if not user.check_password(serializer.validated_data["oldPassword"]):
            return Response({"detail": "Old password is not correct."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["newPassword"])
        user.save()
        logout(request)  # Log out the user to enforce re-authentication with the new password
        return Response({"detail": "Password updated, please log in again."}, status=status.HTTP_200_OK)

