from django.db.models import Q
from rest_framework import status, permissions, authentication
from rest_framework.response import Response
from rest_framework.views import APIView

from common.models import Product, Category
from search.serializers import ProductReadSerializer, CategoryReadSerializer


class CategoryView(APIView):
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Get a list of categories
        """
        categories = Category.objects.all()
        serialized = CategoryReadSerializer(categories, many=True)
        return Response(serialized.data)


class ProductDetailView(APIView):
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

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
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Get a list of products based on query parameters
        :param request:
        :return:
        """
        query_params = request.query_params
        filters = Q()

        if 'item_id' in query_params and query_params['item_id']:
            filters &= Q(id=query_params['item_id'])
        if 'name' in query_params and query_params['name']:
            filters &= Q(name__icontains=query_params['name'])
        if 'category' in query_params and query_params['category']:
            filters &= Q(category__name__icontains=query_params['category'])
        if 'sub_category' in query_params and query_params['sub_category']:
            filters &= Q(sub_category__name__icontains=query_params['sub_category'])
        if 'store_id' in query_params and query_params['store_id']:
            filters &= Q(store__id=query_params['store_id'])
        if 'min_price' in query_params and query_params['min_price']:
            try:
                min_price = float(query_params['min_price'])
                filters &= Q(price__gte=min_price)
            except ValueError:
                return Response({"error": "Invalid min_price parameter"}, status=status.HTTP_400_BAD_REQUEST)
        if 'max_price' in query_params and query_params['max_price']:
            try:
                max_price = float(query_params['max_price'])
                filters &= Q(price__lte=max_price)
            except ValueError:
                return Response({"error": "Invalid max_price parameter"}, status=status.HTTP_400_BAD_REQUEST)
        if 'min_comparison_price' in query_params and query_params['min_comparison_price']:
            try:
                min_comparison_price = float(query_params['min_comparison_price'])
                filters &= Q(comparison_price__gte=min_comparison_price)
            except ValueError:
                return Response({"error": "Invalid min_comparison_price parameter"}, status=status.HTTP_400_BAD_REQUEST)
        if 'max_comparison_price' in query_params and query_params['max_comparison_price']:
            try:
                max_comparison_price = float(query_params['max_comparison_price'])
                filters &= Q(comparison_price__lte=max_comparison_price)
            except ValueError:
                return Response({"error": "Invalid max_comparison_price parameter"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            limit = int(query_params.get('limit'))
            offset = int(query_params.get('offset'))
        except (TypeError, ValueError):
            return Response({"error": "Invalid limit or from parameter"}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch only the items needed for the current page
        products = Product.objects.filter(filters)[offset:offset + limit]
        items_data = ProductReadSerializer(products, many=True).data

        return Response(items_data)
