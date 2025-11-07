import logging
from celery import shared_task
from django.utils import timezone
from .services import WatiService
from .models import WhatsAppCampaign


@shared_task(bind=True, max_retries=3)
def send_scheduled_whatsapp_task(self, campaign_id):
    """
    Celery task to send scheduled WhatsApp message
    
    Args:
        campaign_id: ID of the WhatsAppCampaign instance
    
    Returns:
        dict: Result of the WhatsApp sending operation
    """
    logger = logging.getLogger(__name__)

    try:
        logger.info('Attempting scheduled WhatsApp send for campaign_id=%s', campaign_id)

        # Check if campaign exists and is not cancelled
        try:
            campaign = WhatsAppCampaign.objects.get(id=campaign_id)
            
            # If campaign is cancelled, don't send
            if campaign.status == 'cancelled':
                logger.warning('Campaign %s was cancelled before send; skipping.', campaign_id)
                return {
                    'success': False,
                    'error': 'Campaign was cancelled - response received from user',
                    'campaign_id': campaign_id,
                    'status': 'cancelled'
                }
            
            # If campaign is already sent or failed, don't retry
            if campaign.status in ['success', 'failed']:
                logger.info('Campaign %s already marked as %s, skipping.', campaign_id, campaign.status)
                return {
                    'success': campaign.status == 'success',
                    'campaign_id': campaign_id,
                    'status': campaign.status
                }
        except WhatsAppCampaign.DoesNotExist:
            logger.error('Campaign %s not found when attempting scheduled send.', campaign_id)
            return {
                'success': False,
                'error': 'Campaign not found',
                'campaign_id': campaign_id
            }
        
        wati_service = WatiService()
        result = wati_service.send_template_message(campaign_id)

        if result.get('success'):
            logger.info('Successfully sent scheduled WhatsApp campaign_id=%s', campaign_id)
        else:
            logger.warning('Failed to send scheduled WhatsApp campaign_id=%s error=%s', campaign_id, result.get('error'))
        return result
    except Exception as exc:
        logger.exception('Error sending scheduled WhatsApp campaign_id=%s', campaign_id)
        # Retry the task in case of failure
        raise self.retry(exc=exc, countdown=60)



@shared_task(bind=True)
def process_scheduled_whatsapp_campaigns(self):
    """
    Fallback task that runs hourly to ensure scheduled campaigns are sent.
    It finds any campaigns that should have been sent by now but are still pending/scheduled
    and attempts to send them immediately. This is a safety net for environments where
    Celery countdown tasks might be interrupted.
    """
    logger = logging.getLogger(__name__)
    logger.info('Running fallback processor for scheduled WhatsApp campaigns')

    now = timezone.now()

    campaigns = WhatsAppCampaign.objects.filter(
        status__in=['pending', 'scheduled'],
        scheduled_time__lte=now
    )

    if not campaigns.exists():
        logger.info('No scheduled WhatsApp campaigns pending at %s', now)
        return {'success': True, 'processed': 0}

    wati_service = WatiService()
    processed = 0
    successes = 0
    failures = 0

    for campaign in campaigns:
        processed += 1
        try:
            logger.info('Fallback processing campaign_id=%s mobile=%s scheduled=%s',
                        campaign.id, campaign.mobile_number, campaign.scheduled_time)
            result = wati_service.send_template_message(campaign.id)

            if result.get('success'):
                successes += 1
                logger.info('Fallback send succeeded for campaign_id=%s', campaign.id)
            else:
                failures += 1
                error_msg = result.get('error', 'Unknown error during fallback send')
                logger.warning('Fallback send failed for campaign_id=%s error=%s', campaign.id, error_msg)
                if not campaign.error_message:
                    campaign.error_message = error_msg
                    campaign.save(update_fields=['error_message'])
        except Exception as exc:
            failures += 1
            logger.exception('Exception during fallback processing for campaign_id=%s', campaign.id)
            campaign.status = 'failed'
            campaign.error_message = str(exc)
            campaign.save(update_fields=['status', 'error_message'])

    logger.info('Fallback processor complete: processed=%s success=%s failure=%s', processed, successes, failures)
    return {'success': True, 'processed': processed, 'successes': successes, 'failures': failures}


