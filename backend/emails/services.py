from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From
from django.conf import settings
from .models import EmailCampaign
import requests


class EmailService:
    """
    Service class to handle SendGrid email operations
    """
    
    def __init__(self):
        self.api_key = settings.SENDGRID_API_KEY
        if not self.api_key:
            raise ValueError("SENDGRID_API_KEY is not configured in settings")
        self.client = SendGridAPIClient(self.api_key)
        self.kickbox_api_key = getattr(settings, 'KICKBOX_API_KEY', '')

    def verify_emails_with_kickbox(self, emails):
        """
        Verify emails using Kickbox API and split into deliverable and undeliverable.

        Args:
            emails (list[str]): List of email addresses

        Returns:
            dict: { 'deliverable': [...], 'undeliverable': [...], 'unknown': [...], 'errors': [...] }
        """
        if not self.kickbox_api_key:
            # If Kickbox key not configured, treat all as deliverable
            return {
                'deliverable': emails,
                'undeliverable': [],
                'unknown': [],
                'errors': []
            }

        deliverable = []
        undeliverable = []
        unknown = []
        errors = []

        for email in emails:
            try:
                resp = requests.get(
                    'https://api.kickbox.com/v2/verify',
                    params={'email': email, 'apikey': self.kickbox_api_key},
                    timeout=10
                )
                if resp.status_code != 200:
                    unknown.append(email)
                    errors.append(f"{email}: HTTP {resp.status_code}")
                    continue
                data = resp.json()
                result = data.get('result')  # deliverable, undeliverable, risky, unknown
                if result == 'deliverable':
                    deliverable.append(email)
                elif result == 'undeliverable':
                    undeliverable.append(email)
                else:
                    unknown.append(email)
            except Exception as e:
                unknown.append(email)
                errors.append(f"{email}: {str(e)}")

        return {
            'deliverable': deliverable,
            'undeliverable': undeliverable,
            'unknown': unknown,
            'errors': errors
        }
    
    def send_template_email(self, campaign_id):
        """
        Send template email to multiple recipients
        
        Args:
            campaign_id: ID of the EmailCampaign instance
        
        Returns:
            dict: Result with success status and message
        """
        try:
            campaign = EmailCampaign.objects.get(id=campaign_id)
            campaign.status = 'processing'
            campaign.save()
            
            recipients = campaign.get_recipients_list()
            campaign.total_emails = len(recipients)
            campaign.save()
            
            successful = 0
            failed = 0
            errors = []

            # Step 1: Verify recipients with Kickbox
            verification = self.verify_emails_with_kickbox(recipients)
            recipients_to_send = verification['deliverable']
            # Count undeliverable as failed immediately
            failed += len(verification['undeliverable'])
            if verification['errors']:
                errors.extend(verification['errors'])
            
            # Store deliverable and undeliverable email lists
            campaign.deliverable_emails = ','.join(verification['deliverable']) if verification['deliverable'] else ''
            campaign.undeliverable_emails = ','.join(verification['undeliverable']) if verification['undeliverable'] else ''
            campaign.save()
            
            for recipient_email in recipients_to_send:
                try:
                    # Create message using template
                    message = Mail(
                        from_email=From(f'noreply@{campaign.domain_name}', 'Email Dashboard'),
                        to_emails=recipient_email
                    )
                    message.template_id = campaign.template_id
                    
                    # Send email
                    response = self.client.send(message)
                    
                    if response.status_code in [200, 201, 202]:
                        successful += 1
                    else:
                        failed += 1
                        errors.append(f"{recipient_email}: Status {response.status_code}")
                
                except Exception as e:
                    failed += 1
                    errors.append(f"{recipient_email}: {str(e)}")
            
            # Update campaign status
            campaign.successful_emails = successful
            campaign.failed_emails = failed
            
            if failed == 0:
                campaign.status = 'success'
            elif successful == 0:
                campaign.status = 'failed'
                campaign.error_message = '; '.join(errors)
            else:
                campaign.status = 'partial'
                campaign.error_message = '; '.join(errors)
            
            campaign.save()
            
            return {
                'success': True,
                'campaign_id': campaign.id,
                'total': campaign.total_emails,
                'successful': successful,
                'failed': failed,
                'status': campaign.status,
                'errors': errors if errors else None
            }
        
        except EmailCampaign.DoesNotExist:
            return {
                'success': False,
                'error': 'Campaign not found'
            }
        except Exception as e:
            # Update campaign status to failed
            try:
                campaign.status = 'failed'
                campaign.error_message = str(e)
                campaign.save()
            except:
                pass
            
            return {
                'success': False,
                'error': str(e)
            }



