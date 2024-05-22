from rest_framework import serializers

from common.models import Product


class ProductReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'sub_category', 'price', 'currency', 'image', 'store']

