import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import FavoriteIcon from '@material-ui/icons/Favorite';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import AlbumIcon from '@material-ui/icons/Album';
import { mediaApi } from '../../services/api'; // Import API service

const LibraryContainer = styled.div`
  padding: 24px;
  color: white;
  height: calc(100vh - 90px); /* Adjust height considering player */
  overflow-y: auto;
`;

const Header = styled.h1`
  margin-bottom: 32px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #282828;
  padding-bottom: 10px;
`;

interface TabButtonProps {
  active: boolean;
}

const Tab = styled.button<TabButtonProps>`
  background: transparent;
  border: none;
  color: ${(props: TabButtonProps) => props.active ? 'white' : '#b3b3b3'};
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  border-bottom: ${(props: TabButtonProps) => props.active ? '2px solid #1db954' : 'none'};
  transition: color 0.2s;

  &:hover {
    color: white;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Slightly larger cards */
  gap: 24px;
`;

// Generic Card component - adjust based on actual data structure
const Card = styled(Link)`
  background: #181818;
  padding: 16px;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: background-color 0.3s;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    background: #282828;
  }
`;

const CardImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1; /* Ensure square images */
  object-fit: cover;
  border-radius: 4px;
  background-color: #333; /* Placeholder bg */
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #b3b3b3;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Using global types declared in src/types/index.d.ts
// Adapting based on observed TS errors

type LibraryTab = 'playlists' | 'songs' | 'videos'; // Removed 'albums'

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('playlists');
  // Use global types for state - assuming API returns data compatible with these types
  const [playlists, setPlaylists] = useState<Playlist[]>([]); // Assuming Playlist has songs/videos
  const [favoriteSongs, setFavoriteSongs] = useState<Media[]>([]);
  const [favoriteVideos, setFavoriteVideos] = useState<Media[]>([]);
  // Removed favoriteAlbums state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibraryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [playlistsRes, favoritesRes] = await Promise.all([
          mediaApi.getUserPlaylists(),
          mediaApi.getUserFavoriteObject()
        ]);

        setPlaylists(playlistsRes?.data || []);

        const favData = favoritesRes?.data;
        if (favData) {
          setFavoriteSongs(favData.songs || []);
          setFavoriteVideos(favData.videos || []);
        } else {
          setFavoriteSongs([]);
          setFavoriteVideos([]);
        }

      } catch (err) {
        console.error('Error fetching library data:', err);
        setError('Failed to load library. Please try again later.');
        setPlaylists([]);
        setFavoriteSongs([]);
        setFavoriteVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, []);

  const renderContent = () => {
    if (loading) return <p>Loading your library...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    switch (activeTab) {
      case 'playlists':
        if (playlists.length === 0) return <p>You haven't created any playlists yet.</p>;
        return playlists.map(playlist => (
          <Card key={`playlist-${playlist.id}`} to={`/playlist/${playlist.id}`}>
            <CardImage src={playlist.songs?.[0]?.cover_image || playlist.videos?.[0]?.thumbnail || '/default-playlist.png'} alt={playlist.name} />
            <CardTitle>{playlist.name}</CardTitle>
            <CardDescription>Playlist</CardDescription>
          </Card>
        ));
      case 'songs':
         if (favoriteSongs.length === 0) return <p>You haven't liked any songs yet.</p>;
        return favoriteSongs.map(item => (
          <Card key={`song-${item.id}`} to={`#`} onClick={(e) => { e.preventDefault(); console.log("Play song:", item.id, item.audio_file || item.url); }}>
            <CardImage src={item.cover_image || '/default-song.png'} alt={item.title} />
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.artist || 'Unknown Artist'}</CardDescription>
          </Card>
        ));
      case 'videos':
         if (favoriteVideos.length === 0) return <p>You haven't liked any videos yet.</p>;
        return favoriteVideos.map(video => (
          <Card key={`video-${video.id}`} to={`/video/${video.id}`}>
            <CardImage src={video.thumbnail ? video.thumbnail : '/default-video.png'} alt={video.title} />
            <CardTitle>{video.title}</CardTitle>
            <CardDescription>{video.artist || 'Unknown Artist'}</CardDescription>
          </Card>
        ));
      default:
        return null;
    }
  };

  return (
    <LibraryContainer>
      <Header>Your Library</Header>

      <Tabs>
        <Tab
          active={activeTab === 'playlists'}
          onClick={() => setActiveTab('playlists')}
        >
          <PlaylistPlayIcon /> Playlists
        </Tab>
        <Tab
          active={activeTab === 'songs'}
          onClick={() => setActiveTab('songs')}
        >
          <MusicNoteIcon /> Liked Songs
        </Tab>
        <Tab
          active={activeTab === 'videos'}
          onClick={() => setActiveTab('videos')}
        >
          <VideoLibraryIcon /> Liked Videos
        </Tab>
         {/* Removed Liked Albums Tab */}
      </Tabs>

      <Grid>
        {renderContent()}
      </Grid>
    </LibraryContainer>
  );
};

export default Library;
