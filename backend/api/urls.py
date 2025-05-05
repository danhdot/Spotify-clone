from django.urls import path
from . import views
urlpatterns = [
    
    path('artists/', views.ArtistList.as_view(), name='artist-list'),
    path('artists/<int:pk>/', views.ArtistDetail.as_view(), name='artist-detail'),

    path('albums/', views.AlbumList.as_view(), name='album-list'),
    path('albums/<int:pk>/', views.AlbumDetail.as_view(), name='album'),
    path('albums/<int:album_id>/add_songs/', views.AddSongToAlbumView.as_view(), name='add-songs-to-album'),
    # path('albums/<int:album_id>/remove_songs/', views.RemoveSongFromAlbumView.as_view(), name='remove-songs-from-album'),
    path('albums/<int:album_id>/songs/', views.AlbumSongsView.as_view(), name='album-songs'),

    path('songs/', views.SongList.as_view(), name='song-list'),
    path('songs/<int:pk>/', views.SongDetail.as_view(), name='song'),
    path('search/', views.SongSearchAPI.as_view(), name='search'),

    path('playlists/', views.PlaylistAPI.as_view(), name='playlist-list-create'),
    path('playlists/<int:pk>/', views.PlaylistDetailAPI.as_view(), name='playlist-detail'),
    path('playlists/<int:pk>/songs/', views.PlaylistSongAPI.as_view(), name='playlist-song'),

    path('auth/login/', views.LoginAPI.as_view(), name='login'),
    path('auth/logout/', views.LogoutAPI.as_view(), name='logout'),

    path('auth/user/', views.UserInfoAPI.as_view(), name='user-info'),
    path('auth/register/', views.RegisterAPI.as_view(), name='register'),

    path('users/', views.UserListAPI.as_view(), name='user-list'),

    path('recent-chats/', views.RecentChatsAPI.as_view(), name='recent-chats'),
    
    path('messages/<str:receiver_username>/', views.MessageHistoryAPI.as_view(), name='message-history'),
]