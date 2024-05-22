from django.http import JsonResponse
from django.http import JsonResponse
from rest_framework import permissions, authentication
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.models import Product
from scraper.serializers import ProductReadSerializer
from .scraping_controller import controller


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
