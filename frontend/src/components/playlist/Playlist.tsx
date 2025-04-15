import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { mediaApi } from '../../services/api';
import { useMediaState } from '../../services/mediaState';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'; // Icon for not liked
import FavoriteIcon from '@material-ui/icons/Favorite'; // Icon for liked

interface StyledProps {
  isPlaying: boolean;
}

const PlaylistContainer = styled.div`
  padding: 20px;
  color: white;
`;

const Header = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const CoverImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin-right: 20px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0;
  margin-bottom: 10px;
`;

const Details = styled.div`
  color: #b3b3b3;
`;

const TrackList = styled.div`
  margin-top: 20px;
`;

const Track = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.isPlaying ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  margin-right: 10px;
`;

const TypeIcon = styled.span`
  margin-right: 10px;
  color: #b3b3b3;
`;

const Duration = styled.span`
  margin-left: auto;
  color: #b3b3b3;
  display: flex; /* Align duration and like button */
  align-items: center;
  gap: 15px; /* Space between duration and like button */
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;

  &:hover {
    color: #1db954; /* Highlight on hover */
  }
`;


export const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const { state, play } = useMediaState();
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [likedSongIds, setLikedSongIds] = useState<Set<number>>(new Set());
  const [likedVideoIds, setLikedVideoIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchPlaylistAndFavorites = useCallback(async () => {
     if (!id) return;
     setLoading(true);
     setError(null);
     try {
       const [playlistRes, favoriteRes] = await Promise.all([
         mediaApi.getPlaylist(Number(id)),
         mediaApi.getUserFavoriteObject() // Fetch favorite object
       ]);

       setPlaylist(playlistRes.data);

       if (favoriteRes.data) {
         setFavoriteId(favoriteRes.data.id || 0); // Use 0 as default if id is missing
         setLikedSongIds(new Set(favoriteRes.data.songs.map(s => s.id)));
         setLikedVideoIds(new Set(favoriteRes.data.videos.map(v => v.id)));
       }
     } catch (err) {
       console.error('Error fetching playlist or favorites:', err);
       setError('Failed to load playlist data.');
       // Handle specific error if favorite object not found
       if (err instanceof Error && err.message.includes("Favorite object not found")) {
            console.warn("Favorite object not found, like functionality disabled.");
            // Optionally, try to create a favorite object here if backend doesn't auto-create
       }
     } finally {
       setLoading(false);
     }
   }, [id]);

  useEffect(() => {
    fetchPlaylistAndFavorites();
  }, [fetchPlaylistAndFavorites]); // Rerun if id changes

  const handleToggleLike = async (track: any) => { // Use 'any' for now due to mixed types
    if (!favoriteId) {
      alert("Could not determine favorite list ID. Please try again later.");
      return;
    }

    const trackId = track.id;
    const isVideo = !!track.video_file; // Check if it's a video based on property

    try {
      if (isVideo) {
        await mediaApi.toggleFavoriteVideo(favoriteId, trackId);
        setLikedVideoIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(trackId)) {
            newSet.delete(trackId);
          } else {
            newSet.add(trackId);
          }
          return newSet;
        });
      } else {
        await mediaApi.toggleFavoriteSong(favoriteId, trackId);
        setLikedSongIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(trackId)) {
            newSet.delete(trackId);
          } else {
            newSet.add(trackId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite status.");
    }
  };


  if (loading) return <PlaylistContainer>Loading...</PlaylistContainer>;
  if (error) return <PlaylistContainer>{error}</PlaylistContainer>;
  if (!playlist) return <PlaylistContainer>Playlist not found.</PlaylistContainer>;

  // Combine songs and videos, adding a type property for easier handling
  const allTracks = [
      ...(playlist.songs || []).map((s: any) => {
        const { id, title, artist, audio_file, video_file, cover_image, thumbnail } = s;
        return {
          id: id,
          title: title,
          artist: artist,
          url: audio_file || '',
          type: 'song',
          thumbnail: cover_image || thumbnail || '',
          audio_file: audio_file || '',
          video_file: video_file || ''
        };
      }),
      ...(playlist.videos || []).map((v: any) => {
        const { id, title, artist, audio_file, video_file, cover_image, thumbnail } = v;
        return {
          id: id,
          title: title,
          artist: artist,
          url: video_file || '',
          type: 'video',
          thumbnail: cover_image || thumbnail || '',
          audio_file: audio_file || '',
          video_file: video_file || ''
        };
      })
  ];


  return (
    <PlaylistContainer>
      {/* Header remains similar, adjust image logic if needed */}
      <Header>
        <CoverImage src={playlist.songs?.[0]?.cover_image || playlist.videos?.[0]?.thumbnail || '/default-playlist.png'} alt={playlist.name} />
        <Info>
          <Title>{playlist.name}</Title>
          <Details>{allTracks.length} tracks</Details>
        </Info>
      </Header>
      <TrackList>
        {allTracks.map((track) => {
          const isLiked = track.type === 'song' ? likedSongIds.has(track.id) : likedVideoIds.has(track.id);
          return (
            <Track
              key={`${track.type}-${track.id}`} // Use unique key
              isPlaying={state.currentMedia?.id === track.id && state.currentMedia?.type === track.type}
              // Prevent playing when clicking the like button
              onClick={(e) => {
                  // Check if the click target is the like button or its child icon
                  const target = e.target as HTMLElement;
                  if (!target.closest('.like-button-wrapper')) {
                      const trackAny: any = track;
                      const media: Media = {
                        id: track.id,
                        title: track.title,
                        artist: track.artist,
                        url: track.audio_file || track.video_file,
                        type: track.type === 'song' ? 'song' : 'video',
                        thumbnail: track.cover_image || track.thumbnail || '',
                        audio_file: track.audio_file || '',
                        video_file: track.video_file || ''
                      };
                      play(media); // Pass necessary info to play
                  }
              }}
            >
              <PlayButton>
                {state.currentMedia?.id === track.id && state.currentMedia?.type === track.type && state.isPlaying ? '⏸️' : '▶️'}
              </PlayButton>
              <TypeIcon>{track.type === 'video' ? '🎥' : '🎵'}</TypeIcon>
              {track.title} - <span style={{color: '#888'}}>{track.artist}</span> {/* Added artist */}
              <Duration>
                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                {/* Add Like Button */}
                {favoriteId && ( // Only show if favorite object ID is available
                  <LikeButton
                    className="like-button-wrapper" // Add class to help with click target check
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent track onClick from firing
                        handleToggleLike(track);
                    }}
                  >
                    {isLiked ? <FavoriteIcon style={{ color: '#1db954' }} /> : <FavoriteBorderIcon />}
                  </LikeButton>
                )}
              </Duration>
            </Track>
          );
        })}
      </TrackList>
    </PlaylistContainer>
  );
};
