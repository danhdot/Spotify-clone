from django.db import models
from django.contrib.auth.models import User
    
# Model Nghệ sĩ (Artist)
class Artist(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# Model Album
class Album(models.Model):
    title = models.CharField(max_length=100)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    release_date = models.DateField(null=True, blank=True)
    image = models.ImageField(upload_to='album_covers/', blank=True, null=True)

    def __str__(self):
        return self.title


# Model Bài hát (Song)
class Song(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='songs/', blank=True, null=True) 
    artists = models.ManyToManyField(Artist)
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True)
    duration = models.DurationField()
    audio_file = models.FileField(upload_to='album_covers/', default='')
    video_file = models.FileField(upload_to='song_videos/', blank=True, null=True)

    def __str__(self):
        return self.title

# Model Playlist
class Playlist(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    songs = models.ManyToManyField(Song)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.sender} to {self.receiver}: {self.content}'