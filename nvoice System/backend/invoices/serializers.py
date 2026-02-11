from rest_framework import serializers
from .models import Invoice, Company, MobileSync

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    frozen_by_name = serializers.ReadOnlyField(source='frozen_by.username')
    unfrozen_by_name = serializers.ReadOnlyField(source='unfrozen_by.username')
    
    class Meta:
        model = Invoice
        fields = '__all__'

class MobileSyncSerializer(serializers.ModelSerializer):
    class Meta:
        model = MobileSync
        fields = '__all__'
