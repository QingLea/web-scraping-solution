from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework import permissions, authentication
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.models import Product
from scraper.serializers import LoginSerializer, ProductReadSerializer, SignupSerializer, UpdateAccountSerializer
from .scraping_controller import controller


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


class UserView(APIView):
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email
        })


class SignupView(APIView):
    """
    Signup a new user.
    """

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                username=serializer.validated_data["username"],
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": f"User {user.username} signed up successfully."}, status=status.HTTP_201_CREATED)


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


class ProductView(APIView):
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, product_id):
        """
        detailed view of a product
        """
        try:
            product = Product.objects.filter(pk=product_id, owner=request.user).first()
            if not product:
                return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
            serialized = ProductReadSerializer(product)
            return Response(serialized.data, content_type='application/json')
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductsView(APIView):

    def get_permissions(self):
        """Set permissions dynamically based on the request method."""
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        key_word = request.query_params.get('key_word', '')
        products = Product.objects.filter(name__contains=key_word) if key_word else Product.objects.all()
        serializer = ProductReadSerializer(products, many=True)
        return Response(serializer.data, content_type='application/json')


class StartScrapingView(APIView):
    # todo uncomment the following lines to enable authentication
    # authentication_classes = [authentication.SessionAuthentication]
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = controller.start_scraping()
        return JsonResponse({"message": message})


class StopScrapingView(APIView):
    def post(self, request):
        message = controller.stop_scraping()
        return JsonResponse({"message": message})


class ForceStopScrapingView(APIView):
    def post(self, request):
        message = controller.force_stop_scraping()
        return JsonResponse({"message": message})


class ScrapingStatusView(APIView):
    def get(self, request):
        status = controller.get_status()
        return JsonResponse(status)


class ResetScrapingView(APIView):
    def post(self, request):
        message = controller.reset_scraping()
        return JsonResponse({"message": message})
