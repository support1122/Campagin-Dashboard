# Generated manually for adding cancellation fields to WhatsAppCampaign

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('whatsapp', '0002_add_parameters_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='whatsappcampaign',
            name='cancellation_reason',
            field=models.TextField(blank=True, help_text='Reason for cancellation', null=True),
        ),
        migrations.AddField(
            model_name='whatsappcampaign',
            name='received_message',
            field=models.TextField(blank=True, help_text='Last message received from user', null=True),
        ),
        migrations.AlterField(
            model_name='whatsappcampaign',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('scheduled', 'Scheduled'), ('processing', 'Processing'), ('success', 'Success'), ('failed', 'Failed'), ('cancelled', 'Cancelled')], default='pending', max_length=20),
        ),
    ]

