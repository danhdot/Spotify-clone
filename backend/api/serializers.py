from rest_framework import serializers
from .models import Artist, Album, Song, Playlist, Message
from django.contrib.auth.models import User
import re
from datetime import timedelta

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = '__all__'

class AlbumSerializer(serializers.ModelSerializer):
    # artist = ArtistSerializer(read_only=True)
    artist = serializers.PrimaryKeyRelatedField(queryset=Artist.objects.all())
    
    class Meta:
        model = Album
        fields = '__all__'


class SongSerializer(serializers.ModelSerializer):
    artists = ArtistSerializer(many=True, read_only=True)
    album = AlbumSerializer(read_only=True)
    artist_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Artist.objects.all(),
        source='artists',
        required=True
    )
    album_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=Album.objects.all(),
        source='album',
        allow_null=True,
        required=False
    )
    image = serializers.ImageField(required=False, allow_null=True)
    audio_file = serializers.FileField(required=False, allow_null=True)
    duration = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    video_file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Song
        fields = ['id', 'title', 'duration', 'artists', 'album', 'artist_ids', 'album_id', 'image', 'audio_file', 'video_file']
        read_only_fields = ['id', 'artists', 'album']

    def validate_duration(self, value):
        if not value:
            return None  # Allow empty/null duration
        match = re.match(r'^(\d{2}):(\d{2}):(\d{2})$', value)
        if not match:
            raise serializers.ValidationError("Duration must be in HH:MM:SS format (e.g., 00:04:30)")
        hours, minutes, seconds = map(int, match.groups())
        if minutes > 59 or seconds > 59:
            raise serializers.ValidationError("Minutes and seconds must be less than 60")
        try:
            return timedelta(hours=hours, minutes=minutes, seconds=seconds)
        except ValueError:
            raise serializers.ValidationError("Invalid duration values")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.duration:
            total_seconds = int(instance.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            data['duration'] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        else:
            data['duration'] = None  # or "00:00:00" if preferred
        return data

    def create(self, validated_data):
        artist_ids = validated_data.pop('artists', [])
        album = validated_data.pop('album', None)
        duration = validated_data.pop('duration', None)
        song = Song.objects.create(**validated_data, duration=duration)
        if artist_ids:
            song.artists.set(artist_ids)
        if album is not None:
            song.album = album
        song.save()
        return song

    def update(self, instance, validated_data):
        artist_ids = validated_data.pop('artists', None)
        album = validated_data.pop('album', None)
        duration = validated_data.pop('duration', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if duration is not None:
            instance.duration = duration
        if artist_ids is not None:
            instance.artists.set(artist_ids)
        if album is not None:
            instance.album = album
        instance.save()
        return instance

class PlaylistSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)
    # user = serializers.PrimaryKeyRelatedField(read_only=True)
    song_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Song.objects.all(),
        source='songs',
        required=False
    )

    class Meta:
        model = Playlist
        fields = ['id', 'name', 'user', 'songs', 'song_ids', 'created_at']

    def create(self, validated_data):
        song_ids = validated_data.pop('songs', [])
        playlist = Playlist.objects.create(**validated_data)
        if song_ids:
            playlist.songs.set(song_ids)
        return playlist

    def update(self, instance, validated_data):
        song_ids = validated_data.pop('songs', None)
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        if song_ids is not None:
            instance.songs.set(song_ids)
        return instance

class UserSerializer(serializers.ModelSerializer):
    playlists = PlaylistSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username', read_only=True)
    receiver = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp']