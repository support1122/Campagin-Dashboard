from django.contrib import admin
from .models import WhatsAppCampaign


@admin.register(WhatsAppCampaign)
class WhatsAppCampaignAdmin(admin.ModelAdmin):
    list_display = ['id', 'template_name', 'mobile_number', 'status', 'scheduled_time', 'sent_at', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['template_name', 'mobile_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Campaign Details', {
            'fields': ('template_name', 'template_id', 'mobile_number')
        }),
        ('Scheduling', {
            'fields': ('scheduled_time', 'sent_at')
        }),
        ('Status', {
            'fields': ('status', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

