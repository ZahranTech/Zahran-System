import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'otp_core.settings')
django.setup()

from authentication.models import TOTPDevice
from django.contrib.auth.models import User

try:
    user = User.objects.get(username='admin')
    device = TOTPDevice.objects.filter(user=user).first()
    if device:
        print(f"Device Name: {device.name}")
        print(f"Is Active: {device.is_active}")
        print(f"Secret: {device.secret_key}")
    else:
        print("No device found for admin")
except Exception as e:
    print(f"Error: {e}")
