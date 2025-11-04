from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WhatsAppCampaignViewSet, receive_wati_webhook

router = DefaultRouter()
router.register(r'campaigns', WhatsAppCampaignViewSet, basename='whatsapp-campaign')

urlpatterns = [
    path('', include(router.urls)),
    path('webhook/receive-message/', receive_wati_webhook, name='wati-webhook'),
]

