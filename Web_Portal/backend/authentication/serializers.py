from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import TOTPDevice

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return {'user': user}
        raise serializers.ValidationError("Incorrect Credentials")

class OTPSerializer(serializers.Serializer):
    otp_code = serializers.CharField(max_length=6, min_length=6)

class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TOTPDevice
        fields = ['id', 'name', 'is_active', 'created_at', 'last_used_at']
