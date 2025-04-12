import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';

const LibraryContainer = styled.div`
  padding: 24px;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

interface TabButtonProps {
  active: boolean;
}

const Tab = styled.button<TabButtonProps>`
  background: ${(props: TabButtonProps) => props.active ? '#282828' : 'transparent'};
  border: none;
  color: ${(props: TabButtonProps) => props.active ? 'white' : '#b3b3b3'};
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    color: white;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
`;

const Card = styled(Link)`
  background: #181818;
  padding: 16px;
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: background-color 0.3s;
  &:hover {
    background: #282828;
  }
`;

const CardImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  margin-bottom: 16px;
  border-radius: 4px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 8px 0;
`;

const CardArtist = styled.p`
  font-size: 14px;
  color: #b3b3b3;
  margin: 0;
`;

interface Media {
  id: number;
  title: string;
  artist: string;
  cover_image?: string;
  thumbnail?: string;
}

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'music' | 'videos'>('music');
  const [songs, setSongs] = useState<Media[]>([]);
  const [videos, setVideos] = useState<Media[]>([]);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const [songsRes, videosRes] = await Promise.all([
          fetch('/api/songs/'),
          fetch('/api/videos/')
        ]);
        const songsData = await songsRes.json();
        const videosData = await videosRes.json();
        setSongs(songsData);
        setVideos(videosData);
      } catch (error) {
        console.error('Error fetching library:', error);
      }
    };

    fetchLibrary();
  }, []);

  const currentItems = activeTab === 'music' ? songs : videos;

  return (
    <LibraryContainer>
      <Header>
        <h1>Your Library</h1>
      </Header>

      <Tabs>
        <Tab
          active={activeTab === 'music'}
          onClick={() => setActiveTab('music')}
        >
          <MusicNoteIcon /> Music
        </Tab>
        <Tab
          active={activeTab === 'videos'}
          onClick={() => setActiveTab('videos')}
        >
          <VideoLibraryIcon /> Videos
        </Tab>
      </Tabs>

      <Grid>
        {currentItems.map(item => (
          <Card
            key={item.id}
            to={activeTab === 'music' ? `/song/${item.id}` : `/video/${item.id}`}
          >
            <CardImage
              src={activeTab === 'music' ? item.cover_image : item.thumbnail}
              alt={item.title}
            />
            <CardTitle>{item.title}</CardTitle>
            <CardArtist>{item.artist}</CardArtist>
          </Card>
        ))}
      </Grid>
    </LibraryContainer>
  );
};

export default Library;