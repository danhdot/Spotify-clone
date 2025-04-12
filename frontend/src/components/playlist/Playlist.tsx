import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { mediaApi } from '../../services/api';
import { useMediaState } from '../../services/mediaState';

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
`;

export const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const { state, play } = useMediaState();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await mediaApi.getPlaylist(Number(id));
        setPlaylist(response.data);
      } catch (error) {
        console.error('Error fetching playlist:', error);
      }
    };

    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  if (!playlist) {
    return <PlaylistContainer>Loading...</PlaylistContainer>;
  }

  const allTracks = [...playlist.songs, ...playlist.videos];

  return (
    <PlaylistContainer>
      <Header>
        <CoverImage src={playlist.songs[0]?.cover_image || '/default-cover.jpg'} alt={playlist.name} />
        <Info>
          <Title>{playlist.name}</Title>
          <Details>{allTracks.length} tracks</Details>
        </Info>
      </Header>
      <TrackList>
        {allTracks.map(track => (
          <Track
            key={track.id}
            isPlaying={state.currentMedia?.id === track.id}
            onClick={() => play(track)}
          >
            <PlayButton>
              {state.currentMedia?.id === track.id && state.isPlaying ? '⏸️' : '▶️'}
            </PlayButton>
            <TypeIcon>{track.type === 'video' ? '🎥' : '🎵'}</TypeIcon>
            {track.title}
            <Duration>{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</Duration>
          </Track>
        ))}
      </TrackList>
    </PlaylistContainer>
  );
};