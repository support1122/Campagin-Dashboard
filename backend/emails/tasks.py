from celery import shared_task
from .services import EmailService


@shared_task(bind=True, max_retries=3)
def send_email_campaign_task(self, campaign_id):
    """
    Celery task to send email campaign asynchronously
    
    Args:
        campaign_id: ID of the EmailCampaign instance
    
    Returns:
        dict: Result of the email sending operation
    """
    try:
        email_service = EmailService()
        result = email_service.send_template_email(campaign_id)
        return result
    except Exception as exc:
        # Retry the task in case of failure
        raise self.retry(exc=exc, countdown=60)  # Retry after 60 seconds



