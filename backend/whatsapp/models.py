from django.db import models
from django.utils import timezone
import json


class WhatsAppCampaign(models.Model):
    """
    Model to store WhatsApp campaign logs
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('scheduled', 'Scheduled'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    template_name = models.CharField(max_length=255)
    template_id = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20, help_text="WhatsApp mobile number with country code")
    scheduled_time = models.DateTimeField(help_text="When to send the message")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    parameters = models.JSONField(default=list, blank=True, help_text="Template parameters for dynamic content")
    error_message = models.TextField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True, help_text="Reason for cancellation")
    received_message = models.TextField(blank=True, null=True, help_text="Last message received from user")
    sent_at = models.DateTimeField(blank=True, null=True, help_text="Actual time when message was sent")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'WhatsApp Campaign'
        verbose_name_plural = 'WhatsApp Campaigns'
    
    def __str__(self):
        return f"{self.template_name} - {self.mobile_number} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

