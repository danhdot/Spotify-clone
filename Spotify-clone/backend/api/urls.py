from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'songs', views.SongViewSet)
router.register(r'videos', views.VideoViewSet)
router.register(r'albums', views.AlbumViewSet)
router.register(r'playlists', views.PlaylistViewSet, basename='playlist')
router.register(r'favorites', views.FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('', include(router.urls)),
]