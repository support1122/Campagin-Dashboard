from django.conf import settings
from django.utils import timezone
from .models import WhatsAppCampaign
import requests
import json
import re


class WatiService:
    """
    Service class to handle WATI WhatsApp operations
    """
    
    def __init__(self):
        self.api_base_url = settings.WATI_API_BASE_URL.rstrip('/')  # Remove trailing slash
        self.api_token = settings.WATI_API_TOKEN
        self.channel_number = settings.WATI_CHANNEL_NUMBER
        
        if not self.api_base_url or not self.api_token:
            raise ValueError("WATI_API_BASE_URL and WATI_API_TOKEN must be configured in settings")
        
        # Remove 'Bearer ' prefix if present (we add it ourselves)
        token = self.api_token.replace('Bearer ', '').strip()
        
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_templates(self):
        """
        Fetch all approved WhatsApp templates from WATI
        
        Returns:
            dict: { 'success': bool, 'templates': [...], 'error': '...' }
        """
        try:
            url = f"{self.api_base_url}/api/v1/getMessageTemplates"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # WATI returns templates in a specific format
                templates = data.get('messageTemplates', [])
                
                # Filter only approved templates and extract name/id
                approved_templates = []
                for template in templates:
                    if template.get('status') == 'APPROVED':
                        approved_templates.append({
                            'name': template.get('elementName'),  # WATI uses 'elementName' for template name
                            'id': template.get('id')
                        })
                
                return {
                    'success': True,
                    'templates': approved_templates
                }
            else:
                return {
                    'success': False,
                    'error': f'WATI API error: {response.status_code} - {response.text}'
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_template_id_by_name(self, template_name: str):
        """
        Return template id by its elementName (template name) if approved.
        """
        res = self.get_templates()
        if not res.get('success'):
            return None
        for t in res.get('templates', []):
            if t.get('name') == template_name:
                return t.get('id')
        return None
    
    def get_contacts(self):
        """
        Fetch all contacts from WATI
        
        Returns:
            dict: { 'success': bool, 'contacts': [...], 'error': '...' }
        """
        try:
            url = f"{self.api_base_url}/api/v1/getContacts"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # WATI returns contacts in contact_list format
                contacts = data.get('contact_list', [])
                
                # Extract contact information
                formatted_contacts = []
                for contact in contacts:
                    whatsapp_id = contact.get('wAId', '') or contact.get('phone', '')  # WhatsApp ID (phone number)
                    full_name = contact.get('fullName', '')
                    first_name = contact.get('firstName', '')
                    name = full_name or first_name or whatsapp_id  # Prefer fullName, then firstName, then phone
                    
                    # Ensure phone number has + prefix for WhatsApp
                    phone = whatsapp_id if whatsapp_id.startswith('+') else f'+{whatsapp_id}'
                    
                    formatted_contacts.append({
                        'name': name,
                        'phone': phone,
                        'whatsapp_id': whatsapp_id
                    })
                
                return {
                    'success': True,
                    'contacts': formatted_contacts
                }
            else:
                return {
                    'success': False,
                    'error': f'WATI API error: {response.status_code} - {response.text}'
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_template_message(self, campaign_id):
        """
        Send WhatsApp message using WATI template
        
        Args:
            campaign_id: ID of the WhatsAppCampaign instance
        
        Returns:
            dict: Result with success status and message
        """
        try:
            campaign = WhatsAppCampaign.objects.get(id=campaign_id)
            campaign.status = 'processing'
            campaign.save()
            
            # Send the message
            # WhatsApp number goes in query parameter, channel_number in body
            mobile_number = campaign.mobile_number.replace('+', '') if campaign.mobile_number.startswith('+') else campaign.mobile_number
            
            url = f"{self.api_base_url}/api/v2/sendTemplateMessage?whatsappNumber={mobile_number}"
            
            # Prepare message data for WATI sendTemplateMessage API
            # Normalize channel_number: digits only, ensure starts with '91'
            raw_channel = str(self.channel_number)
            digits_only = re.sub(r"\D", "", raw_channel)
            if not digits_only.startswith('91'):
                digits_only = f"91{digits_only}"

            message_data = {
                "template_name": campaign.template_name,
                "broadcast_name": f"Campaign_{campaign.id}_{campaign.template_name}",
                "channel_number": int(digits_only)
            }
            
            # Add template parameters array if available
            if campaign.parameters:
                message_data["parameters"] = campaign.parameters
            else:
                message_data["parameters"] = []
            
            # Make API request
            response = requests.post(
                url,
                headers=self.headers,
                data=json.dumps(message_data),
                timeout=10
            )
            
            # Update campaign based on response
            if response.status_code in [200, 201, 202]:
                data = response.json()
                if data.get('result') == True or data.get('result') == 'success':
                    campaign.status = 'success'
                    campaign.sent_at = timezone.now()
                else:
                    campaign.status = 'failed'
                    # Store detailed error from WATI response
                    error_msg = data.get('message', 'Unknown error')
                    if not error_msg or error_msg == 'Unknown error':
                        # Fallback to full response for debugging
                        campaign.error_message = f"WATI API error: {json.dumps(data)}"
                    else:
                        campaign.error_message = error_msg
            else:
                campaign.status = 'failed'
                campaign.error_message = f'WATI API HTTP error: {response.status_code} - {response.text[:500]}'
            
            campaign.save()
            
            return {
                'success': campaign.status == 'success',
                'campaign_id': campaign.id,
                'status': campaign.status,
                'error': campaign.error_message if campaign.status == 'failed' else None
            }
        
        except WhatsAppCampaign.DoesNotExist:
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

