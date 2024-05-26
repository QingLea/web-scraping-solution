from rest_framework import serializers

from common.models import Product, Category


class ProductReadSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    sub_category = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"
        # Add `category_name` to the fields
        fields = ["id", "name", "category", "sub_category", "price", "comparison_price", "comparison_unit", "currency",
                  "image", "store", "created", "updated"]

    def get_category(self, obj):
        return obj.category.name if obj.category else None

    def get_sub_category(self, obj):
        return obj.sub_category.name if obj.sub_category else None


class CategoryReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
