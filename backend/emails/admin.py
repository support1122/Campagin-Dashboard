from django.contrib import admin
from .models import EmailCampaign


@admin.register(EmailCampaign)
class EmailCampaignAdmin(admin.ModelAdmin):
    list_display = ['id', 'template_name', 'domain_name', 'status', 'total_emails', 'successful_emails', 'failed_emails', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['template_name', 'domain_name', 'recipients']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Campaign Details', {
            'fields': ('domain_name', 'template_name', 'template_id')
        }),
        ('Recipients', {
            'fields': ('recipients', 'total_emails')
        }),
        ('Status', {
            'fields': ('status', 'successful_emails', 'failed_emails', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )



