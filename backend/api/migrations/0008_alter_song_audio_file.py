# Generated by Django 5.1.7 on 2025-04-01 09:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_alter_song_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='song',
            name='audio_file',
            field=models.FileField(default='', upload_to='album_covers/'),
        ),
    ]
