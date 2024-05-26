from rest_framework import serializers

from common.models import Product, Category


class ProductReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CategoryReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
