from django.db import models
from django.utils import timezone


class EmailCampaign(models.Model):
    """
    Model to store email campaign logs
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('partial', 'Partial Success'),
    ]
    
    domain_name = models.CharField(max_length=255)
    template_name = models.CharField(max_length=255)
    template_id = models.CharField(max_length=255)
    recipients = models.TextField(help_text="Comma-separated email addresses")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_emails = models.IntegerField(default=0)
    successful_emails = models.IntegerField(default=0)
    failed_emails = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, null=True)
    deliverable_emails = models.TextField(blank=True, null=True, help_text="Comma-separated deliverable email addresses")
    undeliverable_emails = models.TextField(blank=True, null=True, help_text="Comma-separated undeliverable email addresses")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Email Campaign'
        verbose_name_plural = 'Email Campaigns'
    
    def __str__(self):
        return f"{self.template_name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def get_recipients_list(self):
        """Convert comma-separated recipients to list"""
        return [email.strip() for email in self.recipients.split(',') if email.strip()]
    
    def get_deliverable_emails_list(self):
        """Convert comma-separated deliverable emails to list"""
        if not self.deliverable_emails:
            return []
        return [email.strip() for email in self.deliverable_emails.split(',') if email.strip()]
    
    def get_undeliverable_emails_list(self):
        """Convert comma-separated undeliverable emails to list"""
        if not self.undeliverable_emails:
            return []
        return [email.strip() for email in self.undeliverable_emails.split(',') if email.strip()]



