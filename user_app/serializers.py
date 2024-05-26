from rest_framework import serializers


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
