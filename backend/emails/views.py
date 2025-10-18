from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EmailCampaign
from .serializers import EmailCampaignSerializer, SendEmailSerializer, PreviewEmailSerializer
from .services import EmailService


class EmailCampaignViewSet(viewsets.ModelViewSet):
    """
    ViewSet for EmailCampaign model
    Provides CRUD operations and custom actions
    """
    queryset = EmailCampaign.objects.all()
    serializer_class = EmailCampaignSerializer
    
    def get_serializer_class(self):
        if self.action == 'send_email':
            return SendEmailSerializer
        if self.action == 'preview':
            return PreviewEmailSerializer
        return EmailCampaignSerializer
    
    @action(detail=False, methods=['post'])
    def send_email(self, request):
        """
        Custom action to send email campaign
        
        POST /api/emails/campaigns/send_email/
        Body: {
            "domain_name": "example.com",
            "template_name": "Welcome Email",
            "template_id": "d-xxxxx",
            "recipients": "email1@example.com, email2@example.com"
        }
        """
        serializer = SendEmailSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create campaign record
            campaign = EmailCampaign.objects.create(
                domain_name=serializer.validated_data['domain_name'],
                template_name=serializer.validated_data['template_name'],
                template_id=serializer.validated_data['template_id'],
                recipients=serializer.validated_data['recipients'],
                status='pending'
            )
            
            try:
                # Send emails synchronously (for now)
                # In future, you can use: send_email_campaign_task.delay(campaign.id)
                email_service = EmailService()
                result = email_service.send_template_email(campaign.id)
                
                if result['success']:
                    return Response({
                        'success': True,
                        'message': 'Email campaign sent successfully',
                        'data': {
                            'campaign_id': result['campaign_id'],
                            'total': result['total'],
                            'successful': result['successful'],
                            'failed': result['failed'],
                            'status': result['status']
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'success': False,
                        'error': result.get('error', 'Failed to send emails')
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            except Exception as e:
                campaign.status = 'failed'
                campaign.error_message = str(e)
                campaign.save()
                
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def preview(self, request):
        """
        Preview what would be sent to a specific recipient without sending.

        POST /api/emails/campaigns/preview/
        Body: {
            "domain_name": "example.com",
            "template_name": "Welcome Email",
            "template_id": "d-xxxxx",
            "recipient": "user@example.com"
        }
        """
        serializer = PreviewEmailSerializer(data=request.data)
        if serializer.is_valid():
            email_service = EmailService()
            verification = email_service.verify_emails_with_kickbox([serializer.validated_data['recipient']])
            status_label = (
                'deliverable' if verification['deliverable'] else
                'undeliverable' if verification['undeliverable'] else
                'unknown'
            )
            return Response({
                'success': True,
                'data': {
                    'recipient': serializer.validated_data['recipient'],
                    'deliverability': status_label,
                    'template': {
                        'id': serializer.validated_data['template_id'],
                        'name': serializer.validated_data['template_name']
                    },
                    'from_email': f"noreply@{serializer.validated_data['domain_name']}"
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def logs(self, request):
        """
        Get all campaign logs
        
        GET /api/emails/campaigns/logs/
        """
        campaigns = self.get_queryset()
        serializer = self.get_serializer(campaigns, many=True)
        return Response({
            'success': True,
            'count': campaigns.count(),
            'data': serializer.data
        })



