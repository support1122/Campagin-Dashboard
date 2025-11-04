from celery import shared_task
from .services import WatiService


@shared_task(bind=True, max_retries=3)
def send_scheduled_whatsapp_task(self, campaign_id):
    """
    Celery task to send scheduled WhatsApp message
    
    Args:
        campaign_id: ID of the WhatsAppCampaign instance
    
    Returns:
        dict: Result of the WhatsApp sending operation
    """
    try:
        from .models import WhatsAppCampaign
        
        # Check if campaign exists and is not cancelled
        try:
            campaign = WhatsAppCampaign.objects.get(id=campaign_id)
            
            # If campaign is cancelled, don't send
            if campaign.status == 'cancelled':
                return {
                    'success': False,
                    'error': 'Campaign was cancelled - response received from user',
                    'campaign_id': campaign_id,
                    'status': 'cancelled'
                }
            
            # If campaign is already sent or failed, don't retry
            if campaign.status in ['success', 'failed']:
                return {
                    'success': campaign.status == 'success',
                    'campaign_id': campaign_id,
                    'status': campaign.status
                }
        except WhatsAppCampaign.DoesNotExist:
            return {
                'success': False,
                'error': 'Campaign not found',
                'campaign_id': campaign_id
            }
        
        wati_service = WatiService()
        result = wati_service.send_template_message(campaign_id)
        return result
    except Exception as exc:
        # Retry the task in case of failure
        raise self.retry(exc=exc, countdown=60)



