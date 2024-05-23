from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.models import Product
from search.serializers import ProductReadSerializer


class ProductDetailView(APIView):

    def get(self, request, product_id):
        """
        Detailed view of a product
        """
        try:
            product = Product.objects.get(id=product_id)
            serialized = ProductReadSerializer(product)
            return Response(serialized.data, content_type='application/json')
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductsView(APIView):

    # def get_permissions(self):
    #     """Set permissions dynamically based on the request method."""
    #     if self.request.method == 'GET':
    #         return [permissions.AllowAny()]
    #     return [permissions.IsAuthenticated()]

    def get(self, request):
        """
        Get a list of products based on query parameters
        :param request:
        :return:
        """
        query_params = request.query_params
        filters = Q()

        if 'item_id' in query_params:
            filters &= Q(id=query_params['item_id'])
        if 'name' in query_params:
            filters &= Q(name__icontains=query_params['name'])
        if 'category' in query_params:
            filters &= Q(category__icontains=query_params['category'])
        if 'sub_category' in query_params:
            filters &= Q(sub_category__icontains=query_params['sub_category'])
        if 'store_id' in query_params:
            filters &= Q(store__store_id=query_params['store_id'])
        if 'min_price' in query_params:
            try:
                min_price = float(query_params['min_price'])
                filters &= Q(price__gte=min_price)
            except ValueError:
                pass  # Handle the case where min_price is not a valid float
        if 'max_price' in query_params:
            try:
                max_price = float(query_params['max_price'])
                filters &= Q(price__lte=max_price)
            except ValueError:
                pass  # Handle the case where max_price is not a valid float

            # Handle limit and from parameters
        try:
            limit = int(query_params.get('limit'))
            offset = int(query_params.get('offset'))
        except (TypeError, ValueError):
            return Response({"error": "Invalid limit or from parameter"}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch only the items needed for the current page
        products = Product.objects.filter(filters)[offset:offset + limit]

        items_data = list(
            products.values('id', 'name', 'category', 'sub_category', 'price', 'currency', 'image', 'store_id'))
        return Response(items_data)
