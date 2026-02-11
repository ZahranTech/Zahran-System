from django.db import models
from django.contrib.auth.models import User
import pyotp

class TOTPDevice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='totp_devices')
    name = models.CharField(max_length=64, default='My Device')
    secret_key = models.CharField(max_length=32, editable=False)
    is_active = models.BooleanField(default=True)
    last_verified_counter = models.BigIntegerField(default=-1) 
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.secret_key:
            self.secret_key = pyotp.random_base32()
        super().save(*args, **kwargs)

    def generate_otp_uri(self):
        return pyotp.totp.TOTP(self.secret_key).provisioning_uri(
            name=self.user.email,
            issuer_name="ZahranTeck OTP"
        )

    def verify_token(self, token):
        totp = pyotp.TOTP(self.secret_key)
        return totp.verify(token, valid_window=1)

    def __str__(self):
        return f"{self.user.username} - {self.name}"

class LoginRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('DENIED', 'Denied'),
        ('EXPIRED', 'Expired'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_requests')
    request_id = models.CharField(max_length=64, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    browser = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.status}"
