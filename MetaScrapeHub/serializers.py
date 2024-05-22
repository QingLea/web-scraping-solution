from rest_framework import serializers

from .models import Product


# create serializer for products
class ProductReadSerializer(serializers.ModelSerializer):
    created = serializers.DateTimeField(format="%d/%m,%Y %H:%M")
    updated = serializers.DateTimeField(format="%d/%m,%Y %H:%M")

    class Meta:
        model = Product
        fields = "__all__"


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'description', 'imageUrl', 'price', 'status', 'version']
        extra_kwargs = {
            'version': {'read_only': True}  # Prevent version from being set directly
        }


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
