# Generated by Django 5.1.7 on 2025-03-31 09:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_rename_cover_image_album_image_album_bgcolor_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='song',
            name='album',
        ),
        migrations.AddField(
            model_name='song',
            name='albums',
            field=models.ManyToManyField(blank=True, related_name='songs', to='api.album'),
        ),
    ]
