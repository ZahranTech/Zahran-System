from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import LoginSerializer, OTPSerializer, DeviceSerializer
from .models import TOTPDevice
import pyotp
import qrcode
import base64
import uuid
from io import BytesIO
from .models import LoginRequest

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Check if user has active 2FA device
        device = TOTPDevice.objects.filter(user=user, is_active=True).first()
        
        # Check if mobile request
        is_mobile = (request.headers.get('X-Is-Mobile') == 'true' or 
                     request.headers.get('x-is-mobile') == 'true')

        if is_mobile:
            tokens = get_tokens_for_user(user)
            return Response({
                "status": "SUCCESS",
                "tokens": tokens,
                "is_already_setup": device is not None
            }, status=status.HTTP_200_OK)

        if device:
            temp_token = str(RefreshToken.for_user(user).access_token)
            return Response({
                "status": "2FA_REQUIRED", 
                "message": "Please enter your OTP code",
                "temp_token": temp_token,
                "push_auth_available": True
            }, status=status.HTTP_200_OK)
        else:
            tokens = get_tokens_for_user(user)
            return Response({
                "status": "SETUP_REQUIRED",
                "message": "2FA Setup Required",
                "tokens": tokens 
            }, status=status.HTTP_200_OK)

class Setup2FAView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if TOTPDevice.objects.filter(user=user, is_active=True).exists():
             return Response({"error": "2FA already active. Revoke first."}, status=400)

        device = TOTPDevice.objects.filter(user=user, is_active=False).first()
        
        if device:
            secret = device.secret_key
        else:
            secret = pyotp.random_base32()
            device = TOTPDevice.objects.create(
                user=user, 
                is_active=False, 
                name='Mobile App', 
                secret_key=secret
            )
        
        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(name=user.email, issuer_name="ZahranTeck")
        
        img = qrcode.make(uri)
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return Response({
            "secret": secret,
            "qr_code": f"data:image/png;base64,{img_str}"
        })

    def post(self, request):
        otp_code = request.data.get('otp_code')
        user = request.user
        device = TOTPDevice.objects.filter(user=user, is_active=False).first()
        
        if not device:
            return Response({"error": "No setup pending"}, status=400)

        if device.verify_token(otp_code):
            device.is_active = True
            device.save()
            tokens = get_tokens_for_user(user)
            return Response({
                "status": "SUCCESS", 
                "message": "2FA Enabled Successfully",
                "tokens": tokens
            })
        
        return Response({"error": "Invalid Code"}, status=400)

class VerifyOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated] 

    def post(self, request):
        otp_code = request.data.get('otp_code')
        user = request.user
        
        device = TOTPDevice.objects.filter(user=user, is_active=True).first()
        if not device:
             return Response({"error": "No 2FA device found"}, status=400)
             
        if device.verify_token(otp_code):
            tokens = get_tokens_for_user(user)
            return Response({
                "status": "SUCCESS",
                "tokens": tokens
            })
            
        return Response({"error": "Invalid OTP"}, status=400)

class DeviceListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        devices = TOTPDevice.objects.filter(request.user, is_active=True)
        serializer = DeviceSerializer(devices, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            device = TOTPDevice.objects.get(pk=pk, user=request.user)
            device.delete()
            return Response({"status": "DELETED"})
        except TOTPDevice.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

class SyncDeviceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        device = TOTPDevice.objects.filter(user=user, is_active=True).first()
        if not device:
             return Response({"error": "No active device found"}, status=404)
        
        return Response({
            "secret": device.secret_key,
            "name": device.name
        })

class InitiatePushAuthView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        request_id = str(uuid.uuid4())
        ip = request.META.get('REMOTE_ADDR')
        browser = request.headers.get('User-Agent', 'Unknown Browser')

        LoginRequest.objects.create(
            user=user,
            request_id=request_id,
            ip_address=ip,
            browser=browser
        )
        
        return Response({
            "status": "PENDING",
            "request_id": request_id,
            "message": "Push authentication initiated"
        })

class PendingPushAuthView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pending = LoginRequest.objects.filter(
            user=request.user, 
            status='PENDING'
        ).last()
        
        if not pending:
            return Response({"status": "NO_REQUESTS"})
            
        return Response({
            "status": "FOUND",
            "request_id": pending.request_id,
            "ip": pending.ip_address,
            "browser": pending.browser,
            "time": pending.created_at
        })

class RespondPushAuthView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request_id = request.data.get('request_id')
        action = request.data.get('action') 
        
        try:
            auth_request = LoginRequest.objects.get(request_id=request_id, user=request.user)
            if action == 'APPROVE':
                auth_request.status = 'APPROVED'
            else:
                auth_request.status = 'DENIED'
            auth_request.save()
            return Response({"status": "SUCCESS"})
        except LoginRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

class CheckPushAuthStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, request_id):
        try:
            auth_request = LoginRequest.objects.get(request_id=request_id, user=request.user)
            if auth_request.status == 'APPROVED':
                tokens = get_tokens_for_user(request.user)
                return Response({
                    "status": "APPROVED",
                    "tokens": tokens
                })
            return Response({"status": auth_request.status})
        except LoginRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)
