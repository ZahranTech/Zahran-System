from django.db import models
from django.contrib.auth.models import User

class Company(models.Model):
    name = models.CharField(max_length=255)
    tax_registration_number = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('frozen', 'Frozen (تجميد)'),
    ]

    invoice_id = models.CharField(max_length=100, unique=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='invoices')
    amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    url = models.URLField(max_length=500)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    governance_result = models.TextField(null=True, blank=True)
    governed_by = models.CharField(max_length=255, null=True, blank=True, default='المنظومة الذكية (G-Invoice)')
    error_message = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_invoices')
    frozen_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='frozen_invoices', blank=True)
    unfrozen_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='unfrozen_invoices', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.invoice_id} - {self.company.name}"

class AutomationSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    otp_verified = models.BooleanField(default=False)
    last_heartbeat = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.id} for {self.user.username}"

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    details = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.timestamp} - {self.user.username if self.user else 'System'}: {self.action}"

class MobileSync(models.Model):
    url = models.URLField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)

    def __str__(self):
        return self.url
