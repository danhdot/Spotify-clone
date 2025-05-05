from rest_framework import generics, status, permissions
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Artist, Album, Song, Playlist, Message
from .serializers import ArtistSerializer, AlbumSerializer, SongSerializer, PlaylistSerializer, UserSerializer
from django.contrib.auth import authenticate, logout
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .serializers import MessageSerializer

# Danh sach va tao moi Artist
class ArtistList(generics.ListCreateAPIView):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer

class ArtistDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer

# Danh sach va tao moi Album
class AlbumList(generics.ListCreateAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

class AlbumDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer

class AlbumSongsView(generics.ListAPIView):
    serializer_class = SongSerializer

    def get_queryset(self):
        album_id = self.kwargs['album_id']
        return Song.objects.filter(album__id=album_id)
    
class AddSongToAlbumView(generics.UpdateAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    lookup_url_kwarg = 'album_id'

    def update(self, request, *args, **kwargs):
        album = self.get_object()  # Retrieves Album instance based on album_id
        new_song_ids = request.data.get('song_ids', [])

        # Get current song IDs assigned to the album
        current_songs = Song.objects.filter(album=album)
        current_song_ids = list(current_songs.values_list('id', flat=True))

        # Convert new_song_ids to a set for comparison (to ignore order)
        new_song_ids_set = set(new_song_ids)
        current_song_ids_set = set(current_song_ids)

        # Case 1: New song IDs are identical to current song IDs
        if new_song_ids_set == current_song_ids_set:
            return Response(
                {"message": "Bài hát đã được cập nhật (danh sách không thay đổi)"},
                status=status.HTTP_200_OK
            )

        # Case 2: New song IDs differ from current song IDs
        try:
            # Validate new song IDs (ensure they exist and are unassigned or assigned to this album)
            songs_to_assign = Song.objects.filter(
                Q(id__in=new_song_ids) & (Q(album__isnull=True) | Q(album=album))
            )
            if len(songs_to_assign) != len(new_song_ids_set):
                return Response(
                    {"error": "One or more song IDs are invalid or already assigned to another album"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Remove album assignment from songs that are in current_song_ids but not in new_song_ids
            songs_to_remove = Song.objects.filter(
                album=album, 
                id__in=(current_song_ids_set - new_song_ids_set)
            )
            songs_to_remove.update(album=None)

            # Assign the album to the new songs
            songs_to_assign.update(album=album)

            # Serialize and return the updated album
            serializer = self.get_serializer(album)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
# Danh sach va tao moi Song
class SongList(generics.ListCreateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class SongDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class SongSearchAPI(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        
        if not query:
            return Response([])
            
        songs = Song.objects.filter(
            Q(title__icontains=query) |
            Q(artists__name__icontains=query) |
            Q(album__title__icontains=query)    |
            Q(duration__icontains=query)
        ).distinct()[:20]  # Giới hạn 20 kết quả
        
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)

# Danh sach va tao moi Playlist
class PlaylistAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        playlists = Playlist.objects.filter(user=request.user)
        serializer = PlaylistSerializer(playlists, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Lấy dữ liệu từ request và gán user từ request.user nếu không có
        data = request.data.copy()  # Tạo bản sao để chỉnh sửa
        if 'user' not in data or not data['user']:  # Nếu không có user hoặc user là null
            data['user'] = request.user.id
        serializer = PlaylistSerializer(data=data)
        if serializer.is_valid():
            serializer.save()  # Lưu với user đã được gán
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlaylistDetailAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            playlist = Playlist.objects.get(pk=pk, user=self.request.user)
            serializer = PlaylistSerializer(playlist)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Playlist.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def get_object(self, pk):
        try:
            return Playlist.objects.get(pk=pk, user=self.request.user)
        except Playlist.DoesNotExist:
            return None

    def put(self, request, pk):
        playlist = self.get_object(pk)
        if not playlist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = PlaylistSerializer(playlist, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        playlist = self.get_object(pk)
        if not playlist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        playlist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PlaylistSongAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Playlist.objects.get(pk=pk, user=self.request.user)
        except Playlist.DoesNotExist:
            return None

    def post(self, request, pk):
        playlist = self.get_object(pk)
        if not playlist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        song_id = request.data.get('song_id')
        try:
            song = Song.objects.get(id=song_id)
            playlist.songs.add(song)
            serializer = PlaylistSerializer(playlist)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)
    def delete(self, request, pk):
        playlist = self.get_object(pk)
        if not playlist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        song_id = request.data.get('song_id')
        try:
            song = Song.objects.get(id=song_id)
            playlist.songs.remove(song)
            serializer = PlaylistSerializer(playlist)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=status.HTTP_404_NOT_FOUND)

# Danh sach va tao moi User
class LoginAPI(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            logout(request)
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserInfoAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        })

# Thêm vào api/views.py
class UserListAPI(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        search_query = request.query_params.get('search', '')
        if search_query:
            users = User.objects.filter(username__icontains=search_query, is_staff=False, is_superuser=False)
        else:
            users = User.objects.filter(is_staff=False, is_superuser=False)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class RecentChatsAPI(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        # Lấy danh sách user đã chat với user hiện tại
        sent_messages = Message.objects.filter(sender=user).values('receiver__username').distinct()
        received_messages = Message.objects.filter(receiver=user).values('sender__username').distinct()
        usernames = {m['receiver__username'] for m in sent_messages}.union(
            {m['sender__username'] for m in received_messages}
        )
        users = User.objects.filter(username__in=usernames).exclude(username=user.username)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class RegisterAPI(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        # Kiểm tra dữ liệu đầu vào
        if not username or not email or not password:
            return Response(
                {'error': 'Vui lòng cung cấp đầy đủ username, email và password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra trùng username
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Tên đăng nhập đã tồn tại'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra trùng email
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email này đã được sử dụng'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Tạo user mới
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            user.save()

            # Tạo token cho user vừa đăng ký
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Có lỗi xảy ra: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        # Chỉ cho phép nếu user là superuser
        return request.user and request.user.is_authenticated and request.user.is_superuser
    
class AdminAPI(APIView):
    permission_classes = [IsAuthenticated, IsSuperUser]  # Chỉ superuser mới truy cập được

    def get(self, request):
        return Response({'message': 'Chào mừng đến với Admin API'}, status=status.HTTP_200_OK)
    
class MessageHistoryAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, receiver_username):
        user = request.user
        try:
            receiver = User.objects.get(username=receiver_username)
            messages = Message.objects.filter(
                Q(sender=user, receiver=receiver) | 
                Q(sender=receiver, receiver=user)
            ).order_by('timestamp')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Người dùng không tồn tại'}, status=status.HTTP_404_NOT_FOUND)