# Generated by Django 5.1.7 on 2025-04-01 08:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_album_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='song',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='songs/'),
        ),
    ]
