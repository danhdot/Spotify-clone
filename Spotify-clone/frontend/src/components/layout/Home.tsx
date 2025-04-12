import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  padding: 24px;
  color: white;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
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
  border-radius: 4px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 8px 0;
`;

const CardSubtitle = styled.p`
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

const Home: React.FC = () => {
  const [recentSongs, setRecentSongs] = useState<Media[]>([]);
  const [topVideos, setTopVideos] = useState<Media[]>([]);

  useEffect(() => {
    // Fetch recent songs and top videos
    const fetchData = async () => {
      try {
        const [songsRes, videosRes] = await Promise.all([
          fetch('/api/songs/'),
          fetch('/api/videos/')
        ]);
        const songsData = await songsRes.json();
        const videosData = await videosRes.json();
        setRecentSongs(songsData.slice(0, 6));
        setTopVideos(videosData.slice(0, 6));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <HomeContainer>
      <Section>
        <SectionTitle>Recently Played</SectionTitle>
        <Grid>
          {recentSongs.map((song: Media) => (
            <Card key={song.id} to={`/song/${song.id}`}>
              <CardImage src={song.cover_image} alt={song.title} />
              <CardTitle>{song.title}</CardTitle>
              <CardSubtitle>{song.artist}</CardSubtitle>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Popular Music Videos</SectionTitle>
        <Grid>
          {topVideos.map((video: Media) => (
            <Card key={video.id} to={`/video/${video.id}`}>
              <CardImage src={video.thumbnail} alt={video.title} />
              <CardTitle>{video.title}</CardTitle>
              <CardSubtitle>{video.artist}</CardSubtitle>
            </Card>
          ))}
        </Grid>
      </Section>
    </HomeContainer>
  );
};

export default Home;