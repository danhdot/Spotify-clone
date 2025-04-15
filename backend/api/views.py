from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Song, Video, Album, Playlist, Favorite
from .serializers import (
    SongSerializer, VideoSerializer, AlbumSerializer,
    PlaylistSerializer, FavoriteSerializer, UserSerializer
)

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticated]

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        album = self.get_object()
        song_id = request.data.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        album.songs.add(song)
        return Response({'status': 'song added'})

class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        playlist.songs.add(song)
        return Response({'status': 'song added'})

    @action(detail=True, methods=['post'])
    def add_video(self, request, pk=None):
        playlist = self.get_object()
        video_id = request.data.get('video_id')
        video = get_object_or_404(Video, id=video_id)
        playlist.videos.add(video)
        return Response({'status': 'video added'})

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_song(self, request, pk=None):
        favorite = self.get_object()
        song_id = request.data.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        
        if song in favorite.songs.all():
            favorite.songs.remove(song)
            return Response({'status': 'song removed from favorites'})
        else:
            favorite.songs.add(song)
            return Response({'status': 'song added to favorites'})

    @action(detail=True, methods=['post'])
    def toggle_video(self, request, pk=None):
        favorite = self.get_object()
        video_id = request.data.get('video_id')
        video = get_object_or_404(Video, id=video_id)
        
        if video in favorite.videos.all():
            favorite.videos.remove(video)
            return Response({'status': 'video removed from favorites'})
        else:
            favorite.videos.add(video)
            return Response({'status': 'video added to favorites'})
