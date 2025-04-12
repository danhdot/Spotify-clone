from django.contrib import admin
from .models import Song, Video, Album, Playlist, Favorite

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'duration', 'created_at')
    search_fields = ('title', 'artist')
    list_filter = ('created_at',)

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'duration', 'created_at')
    search_fields = ('title', 'artist')
    list_filter = ('created_at',)

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'created_at')
    search_fields = ('title', 'artist')
    list_filter = ('created_at',)
    filter_horizontal = ('songs',)

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'user__username')
    list_filter = ('created_at',)
    filter_horizontal = ('songs', 'videos')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ('user__username',)
    filter_horizontal = ('songs', 'videos', 'albums')