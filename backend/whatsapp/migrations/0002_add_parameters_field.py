# Generated manually for adding parameters field to WhatsAppCampaign

from django.db import migrations, models


def default_parameters():
    return []


class Migration(migrations.Migration):

    dependencies = [
        ('whatsapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='whatsappcampaign',
            name='parameters',
            field=models.JSONField(blank=True, default=default_parameters, help_text='Template parameters for dynamic content'),
        ),
    ]

