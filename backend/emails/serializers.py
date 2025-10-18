from rest_framework import serializers
from .models import EmailCampaign


class EmailCampaignSerializer(serializers.ModelSerializer):
    """
    Serializer for EmailCampaign model
    """
    class Meta:
        model = EmailCampaign
        fields = [
            'id',
            'domain_name',
            'template_name',
            'template_id',
            'recipients',
            'status',
            'total_emails',
            'successful_emails',
            'failed_emails',
            'deliverable_emails',
            'undeliverable_emails',
            'error_message',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'status', 'total_emails', 'successful_emails', 'failed_emails', 'deliverable_emails', 'undeliverable_emails', 'error_message', 'created_at', 'updated_at']


class SendEmailSerializer(serializers.Serializer):
    """
    Serializer for sending email campaigns
    """
    domain_name = serializers.CharField(max_length=255, required=True)
    template_name = serializers.CharField(max_length=255, required=True)
    template_id = serializers.CharField(max_length=255, required=True)
    recipients = serializers.CharField(required=True, help_text="Comma-separated email addresses")
    
    def validate_recipients(self, value):
        """
        Validate that recipients is a comma-separated list of valid emails
        """
        emails = [email.strip() for email in value.split(',') if email.strip()]
        
        if not emails:
            raise serializers.ValidationError("At least one recipient email is required")
        
        # Basic email validation
        email_validator = serializers.EmailField()
        for email in emails:
            try:
                email_validator.run_validation(email)
            except serializers.ValidationError:
                raise serializers.ValidationError(f"Invalid email address: {email}")
        
        return value



class PreviewEmailSerializer(serializers.Serializer):
    """
    Serializer for previewing a single recipient before sending
    """
    domain_name = serializers.CharField(max_length=255, required=True)
    template_name = serializers.CharField(max_length=255, required=True)
    template_id = serializers.CharField(max_length=255, required=True)
    recipient = serializers.EmailField(required=True)


