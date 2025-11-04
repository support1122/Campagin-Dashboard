from rest_framework import serializers
from .models import WhatsAppCampaign


class WhatsAppCampaignSerializer(serializers.ModelSerializer):
    """
    Serializer for WhatsAppCampaign model
    """
    class Meta:
        model = WhatsAppCampaign
        fields = [
            'id',
            'template_name',
            'template_id',
            'mobile_number',
            'scheduled_time',
            'status',
            'parameters',
            'error_message',
            'cancellation_reason',
            'received_message',
            'sent_at',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'status', 'error_message', 'cancellation_reason', 'received_message', 'sent_at', 'created_at', 'updated_at']


class SendWhatsAppSerializer(serializers.Serializer):
    """
    Serializer for sending WhatsApp campaigns
    """
    template_name = serializers.CharField(max_length=255, required=True)
    template_id = serializers.CharField(max_length=255, required=True)
    mobile_number = serializers.CharField(max_length=20, required=True)
    scheduled_time = serializers.DateTimeField(required=True)
    parameters = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        required=False,
        allow_empty=True,
        help_text="Template parameters array, e.g., [{'name': 'param1', 'value': 'value1'}]"
    )
    
    def validate_mobile_number(self, value):
        """
        Validate mobile number format
        """
        # Basic validation - should contain only digits and optional +
        import re
        if not re.match(r'^\+?[1-9]\d{1,14}$', value):
            raise serializers.ValidationError(
                "Mobile number must be in international format (e.g., +919876543210)"
            )
        return value


class WatiTemplateSerializer(serializers.Serializer):
    """
    Serializer for Wati template structure
    """
    name = serializers.CharField()
    id = serializers.CharField()

