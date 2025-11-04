from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import re
from .models import WhatsAppCampaign
from .serializers import WhatsAppCampaignSerializer, SendWhatsAppSerializer
from .services import WatiService
from .tasks import send_scheduled_whatsapp_task


class WhatsAppCampaignViewSet(viewsets.ModelViewSet):
    """
    ViewSet for WhatsAppCampaign model
    Provides CRUD operations and custom actions
    """
    queryset = WhatsAppCampaign.objects.all()
    serializer_class = WhatsAppCampaignSerializer
    
    def get_serializer_class(self):
        if self.action == 'send_message':
            return SendWhatsAppSerializer
        return WhatsAppCampaignSerializer
    
    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """
        Custom action to send or schedule WhatsApp campaign
        
        POST /api/whatsapp/campaigns/send_message/
        Body: {
            "template_name": "Welcome Message",
            "template_id": "template_123",
            "mobile_number": "+919876543210",
            "scheduled_time": "2025-01-20T10:30:00Z"
        }
        """
        serializer = SendWhatsAppSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Create campaign record
                campaign = WhatsAppCampaign.objects.create(
                    template_name=serializer.validated_data['template_name'],
                    template_id=serializer.validated_data['template_id'],
                    mobile_number=serializer.validated_data['mobile_number'],
                    scheduled_time=serializer.validated_data['scheduled_time'],
                    parameters=serializer.validated_data.get('parameters', []),
                    status='pending'
                )
                
                # Check if message should be sent now or scheduled
                now = timezone.now()
                scheduled_time = serializer.validated_data['scheduled_time']
                
                if scheduled_time <= now:
                    # Send immediately
                    wati_service = WatiService()
                    result = wati_service.send_template_message(campaign.id)
                    
                    if result['success']:
                        # Chain follow-ups if first reminder
                        if campaign.template_name == 'payment_reminder_first':
                            base_time = now
                            await_seconds_4d = 4 * 24 * 60 * 60
                            await_seconds_10d = 10 * 24 * 60 * 60
                            # Resolve template ids
                            second_id = wati_service.get_template_id_by_name('payment_reminder_second')
                            third_id = wati_service.get_template_id_by_name('payment_reminder_third')
                            if second_id:
                                c2 = WhatsAppCampaign.objects.create(
                                    template_name='payment_reminder_second',
                                    template_id=second_id,
                                    mobile_number=campaign.mobile_number,
                                    scheduled_time=base_time + timedelta(days=4),
                                    status='scheduled'
                                )
                                send_scheduled_whatsapp_task.apply_async(args=[c2.id], countdown=await_seconds_4d)
                            if third_id:
                                c3 = WhatsAppCampaign.objects.create(
                                    template_name='payment_reminder_third',
                                    template_id=third_id,
                                    mobile_number=campaign.mobile_number,
                                    scheduled_time=base_time + timedelta(days=10),
                                    status='scheduled'
                                )
                                send_scheduled_whatsapp_task.apply_async(args=[c3.id], countdown=await_seconds_10d)
                        return Response({
                            'success': True,
                            'message': 'WhatsApp message sent successfully',
                            'data': {
                                'campaign_id': result['campaign_id'],
                                'status': result['status']
                            }
                        }, status=status.HTTP_200_OK)
                    else:
                        return Response({
                            'success': False,
                            'error': result.get('error', 'Failed to send message')
                        }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    # Schedule for later using Celery task
                    campaign.status = 'scheduled'
                    campaign.save()
                    
                    # Calculate delay in seconds
                    delay_seconds = (scheduled_time - now).total_seconds()
                    
                    # Schedule the task
                    send_scheduled_whatsapp_task.apply_async(
                        args=[campaign.id],
                        countdown=delay_seconds
                    )
                    # Chain follow-ups if first reminder (relative to scheduled_time)
                    if campaign.template_name == 'payment_reminder_first':
                        wati_service = WatiService()
                        second_id = wati_service.get_template_id_by_name('payment_reminder_second')
                        third_id = wati_service.get_template_id_by_name('payment_reminder_third')
                        if second_id:
                            c2 = WhatsAppCampaign.objects.create(
                                template_name='payment_reminder_second',
                                template_id=second_id,
                                mobile_number=campaign.mobile_number,
                                scheduled_time=scheduled_time + timedelta(days=4),
                                status='scheduled'
                            )
                            send_scheduled_whatsapp_task.apply_async(
                                args=[c2.id],
                                countdown=delay_seconds + 4 * 24 * 60 * 60
                            )
                        if third_id:
                            c3 = WhatsAppCampaign.objects.create(
                                template_name='payment_reminder_third',
                                template_id=third_id,
                                mobile_number=campaign.mobile_number,
                                scheduled_time=scheduled_time + timedelta(days=10),
                                status='scheduled'
                            )
                            send_scheduled_whatsapp_task.apply_async(
                                args=[c3.id],
                                countdown=delay_seconds + 10 * 24 * 60 * 60
                            )
                    
                    return Response({
                        'success': True,
                        'message': f'WhatsApp message scheduled for {scheduled_time}',
                        'data': {
                            'campaign_id': campaign.id,
                            'status': 'scheduled',
                            'scheduled_time': scheduled_time
                        }
                    }, status=status.HTTP_200_OK)
            
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def templates(self, request):
        """
        Get all approved WhatsApp templates from WATI
        
        GET /api/whatsapp/campaigns/templates/
        """
        try:
            wati_service = WatiService()
            result = wati_service.get_templates()
            
            if result['success']:
                return Response({
                    'success': True,
                    'count': len(result['templates']),
                    'data': result['templates']
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Failed to fetch templates')
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def logs(self, request):
        """
        Get all WhatsApp campaign logs
        
        GET /api/whatsapp/campaigns/logs/
        """
        campaigns = self.get_queryset()
        serializer = self.get_serializer(campaigns, many=True)
        return Response({
            'success': True,
            'count': campaigns.count(),
            'data': serializer.data
        })

    @action(detail=True, methods=['post'])
    def send_now(self, request, pk=None):
        """
        Force-send a scheduled campaign immediately.
        POST /api/whatsapp/campaigns/{id}/send_now/
        """
        try:
            campaign = WhatsAppCampaign.objects.get(id=pk)
            wati_service = WatiService()
            result = wati_service.send_template_message(campaign.id)
            if result.get('success'):
                return Response({
                    'success': True,
                    'message': 'WhatsApp message sent successfully',
                    'data': result
                })
            return Response({
                'success': False,
                'error': result.get('error', 'Failed to send message')
            }, status=status.HTTP_400_BAD_REQUEST)
        except WhatsAppCampaign.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Campaign not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a pending/scheduled campaign so it will not be sent by the worker.
        POST /api/whatsapp/campaigns/{id}/cancel/
        Body (optional): { "reason": "string" }
        """
        try:
            campaign = WhatsAppCampaign.objects.get(id=pk)
            if campaign.status not in ['pending', 'scheduled']:
                return Response({
                    'success': False,
                    'error': f'Cannot cancel campaign with status: {campaign.status}'
                }, status=status.HTTP_400_BAD_REQUEST)

            reason = request.data.get('reason') or 'Cancelled by user'
            campaign.status = 'cancelled'
            campaign.cancellation_reason = reason
            campaign.save()

            return Response({
                'success': True,
                'message': 'Campaign cancelled successfully',
                'data': {
                    'campaign_id': campaign.id,
                    'status': campaign.status
                }
            })
        except WhatsAppCampaign.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Campaign not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def send_followup(self, request, pk=None):
        """
        Send a follow-up (second/third) immediately for a given base campaign id.
        Body: { "which": "second" | "third" }
        """
        which = request.data.get('which')
        if which not in ['second', 'third']:
            return Response({'success': False, 'error': 'which must be "second" or "third"'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            base = WhatsAppCampaign.objects.get(id=pk)
            wati_service = WatiService()
            template_map = {
                'second': 'payment_reminder_second',
                'third': 'payment_reminder_third'
            }
            template_name = template_map[which]
            template_id = wati_service.get_template_id_by_name(template_name)
            if not template_id:
                return Response({'success': False, 'error': f'Template id not found for {template_name}'}, status=status.HTTP_400_BAD_REQUEST)
            # Create new campaign and send now
            c = WhatsAppCampaign.objects.create(
                template_name=template_name,
                template_id=template_id,
                mobile_number=base.mobile_number,
                scheduled_time=timezone.now(),
                status='pending'
            )
            result = wati_service.send_template_message(c.id)
            if result.get('success'):
                return Response({'success': True, 'data': result})
            return Response({'success': False, 'error': result.get('error', 'Failed to send')}, status=status.HTTP_400_BAD_REQUEST)
        except WhatsAppCampaign.DoesNotExist:
            return Response({'success': False, 'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def contacts(self, request):
        """
        Get all contacts from WATI
        
        GET /api/whatsapp/campaigns/contacts/
        """
        try:
            wati_service = WatiService()
            result = wati_service.get_contacts()
            
            if result['success']:
                return Response({
                    'success': True,
                    'count': len(result['contacts']),
                    'data': result['contacts']
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': result.get('error', 'Failed to fetch contacts')
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def receive_wati_webhook(request):
    """
    Webhook endpoint to receive messages from Wati
    
    POST /api/whatsapp/webhook/receive-message/
    Body: JSON from Wati webhook
    
    This endpoint:
    1. Receives message data from Wati
    2. Extracts waId (WhatsApp ID) and text message
    3. Finds scheduled/pending campaigns for that number
    4. Cancels those campaigns and stores the received message
    """
    try:
        # Parse JSON data
        try:
            data = json.loads(request.body) if isinstance(request.body, bytes) else request.data
        except (json.JSONDecodeError, AttributeError):
            data = request.data
        
        # Extract waId and text message
        wa_id = data.get('waId')
        text_message = data.get('text', '')
        event_type = data.get('eventType', '')
        
        # Only process message events
        if event_type != 'message':
            return Response({
                'success': True,
                'message': 'Event type is not message, skipping',
                'event_type': event_type
            }, status=status.HTTP_200_OK)
        
        if not wa_id:
            return Response({
                'success': False,
                'error': 'waId is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Normalize phone number: remove +91, ensure format consistency
        # Wati sends waId as "919866855857" (without +)
        # Our database may have "+919866855857" or "919866855857"
        normalized_wa_id = wa_id.replace('+', '').strip()
        
        # Try multiple formats to find matching campaigns
        phone_variants = [
            normalized_wa_id,  # "919866855857"
            f"+{normalized_wa_id}",  # "+919866855857"
        ]
        # If starts with 91, also try without 91 prefix
        if normalized_wa_id.startswith('91') and len(normalized_wa_id) > 2:
            phone_variants.append(normalized_wa_id[2:])  # "9866855857"
            phone_variants.append(f"+{normalized_wa_id[2:]}")  # "+9866855857"
        
        # Find all scheduled/pending campaigns for this number
        cancelled_campaigns = []
        cancelled_count = 0
        
        # Query campaigns with matching mobile number that are scheduled or pending
        campaigns = WhatsAppCampaign.objects.filter(
            mobile_number__in=phone_variants,
            status__in=['pending', 'scheduled']
        )
        
        for campaign in campaigns:
            # Update campaign status to cancelled
            campaign.status = 'cancelled'
            campaign.cancellation_reason = 'Response received from user - webhook triggered'
            campaign.received_message = text_message
            campaign.save()
            cancelled_count += 1
            cancelled_campaigns.append({
                'id': campaign.id,
                'template_name': campaign.template_name,
                'scheduled_time': campaign.scheduled_time.isoformat(),
                'mobile_number': campaign.mobile_number
            })
        
        return Response({
            'success': True,
            'message': f'Cancelled {cancelled_count} scheduled campaign(s)',
            'wa_id': wa_id,
            'normalized_wa_id': normalized_wa_id,
            'received_message': text_message,
            'cancelled_campaigns': cancelled_campaigns,
            'cancelled_count': cancelled_count
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        return Response({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc() if hasattr(request, 'user') and hasattr(request.user, 'is_authenticated') and request.user.is_authenticated else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
