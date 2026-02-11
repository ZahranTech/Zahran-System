from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, CompanyViewSet, MobileSyncViewSet

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet)
router.register(r'companies', CompanyViewSet)
router.register(r'mobile-sync', MobileSyncViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
