import os
import django
from django.core.files import File
from pathlib import Path
import psycopg2
from psycopg2 import Error

try:
    # Kết nối đến PostgreSQL server với database mặc định postgres
    connection = psycopg2.connect(
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "123"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "postgres")
    )
    connection.autocommit = True
    cursor = connection.cursor()

    # Tạo database spotify_clone
    sql_create_database = "CREATE DATABASE spotify_clone"
    cursor.execute(sql_create_database)
    print("Database created successfully!")

except (Exception, Error) as error:
    print("Error while connecting to PostgreSQL", error)
finally:
    if connection:
        cursor.close()
        connection.close()
        print("PostgreSQL connection is closed")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spotify_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Song, Video, Album, Playlist, Favorite

def init_db():
    # Create a superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Created superuser: admin/admin123")

    # Create some sample songs
    songs_data = [
        {
            'title': 'Sample Song 1',
            'artist': 'Artist 1',
            'duration': 180,
        },
        {
            'title': 'Sample Song 2',
            'artist': 'Artist 2',
            'duration': 240,
        },
    ]

    for song_data in songs_data:
        Song.objects.get_or_create(**song_data)
        print(f"Created song: {song_data['title']}")

    # Create some sample videos
    videos_data = [
        {
            'title': 'Sample Music Video 1',
            'artist': 'Artist 1',
            'duration': 240,
        },
        {
            'title': 'Sample Music Video 2',
            'artist': 'Artist 2',
            'duration': 300,
        },
    ]

    for video_data in videos_data:
        Video.objects.get_or_create(**video_data)
        print(f"Created video: {video_data['title']}")

    # Create a sample album
    album_data = {
        'title': 'Sample Album',
        'artist': 'Artist 1',
    }
    album, _ = Album.objects.get_or_create(**album_data)
    album.songs.add(*Song.objects.all())
    print(f"Created album: {album_data['title']}")

    # Create a sample playlist for admin user
    admin_user = User.objects.get(username='admin')
    playlist_data = {
        'name': 'My First Playlist',
        'user': admin_user,
    }
    playlist, _ = Playlist.objects.get_or_create(**playlist_data)
    playlist.songs.add(*Song.objects.all())
    playlist.videos.add(*Video.objects.all())
    print(f"Created playlist: {playlist_data['name']}")

    # Create favorites for admin user
    favorite, _ = Favorite.objects.get_or_create(user=admin_user)
    favorite.songs.add(*Song.objects.all()[:1])
    favorite.videos.add(*Video.objects.all()[:1])
    favorite.albums.add(album)
    print(f"Created favorites for user: {admin_user.username}")

if __name__ == '__main__':
    init_db()
