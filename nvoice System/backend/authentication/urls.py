from django.urls import path
from .views import (
    LoginView, Setup2FAView, VerifyOTPView, DeviceListView, SyncDeviceView,
    InitiatePushAuthView, PendingPushAuthView, RespondPushAuthView, CheckPushAuthStatusView
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('setup-2fa/', Setup2FAView.as_view(), name='setup-2fa'),
    path('verify-2fa/', VerifyOTPView.as_view(), name='verify-2fa'),
    path('sync-device/', SyncDeviceView.as_view(), name='sync-device'),
    path('devices/', DeviceListView.as_view(), name='device-list'),
    path('devices/<int:pk>/', DeviceListView.as_view(), name='device-delete'),
    
    # Push Auth Endpoints
    path('push-auth/initiate/', InitiatePushAuthView.as_view(), name='push-initiate'),
    path('push-auth/pending/', PendingPushAuthView.as_view(), name='push-pending'),
    path('push-auth/respond/', RespondPushAuthView.as_view(), name='push-respond'),
    path('push-auth/status/<str:request_id>/', CheckPushAuthStatusView.as_view(), name='push-status'),
    path('ping/', lambda r: __import__('django.http').JsonResponse({'status': 'ok'}), name='ping'),
]
