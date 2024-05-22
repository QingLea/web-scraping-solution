from rest_framework import serializers

from common.models import Product


class ProductReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'sub_category', 'price', 'currency', 'image', 'store']


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'category', 'sub_category', 'price', 'currency', 'image', 'store']


class LoginSerializer(serializers.Serializer):
    password = serializers.CharField(style={"input_type": "password"})
    username = serializers.CharField()


class SignupSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(style={"input_type": "password"})


class UpdateAccountSerializer(serializers.Serializer):
    oldPassword = serializers.CharField(style={"input_type": "password"})
    newPassword = serializers.CharField(style={"input_type": "password"})
