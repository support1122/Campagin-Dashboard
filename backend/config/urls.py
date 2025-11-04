"""
URL configuration for Email Dashboard project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint for Render"""
    return JsonResponse({'status': 'healthy'})

def api_status(request):
    """API status endpoint"""
    return JsonResponse({'status': 'API is working', 'message': 'Email Dashboard API'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/emails/', include('emails.urls')),
    path('api/whatsapp/', include('whatsapp.urls')),
    path('api/', api_status, name='api_status'),
    path('healthz/', health_check, name='health_check'),
]



