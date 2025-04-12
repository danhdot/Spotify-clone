import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import ReactPlayer from 'react-player';
import { useMediaState } from '../../services/mediaState';
import { mediaApi } from '../../services/api';

const VideoPlayerContainer = styled.div`
  padding: 24px;
  color: white;
`;

const VideoWrapper = styled.div`
  position: relative;
  padding-top: 56.25%;
`;

const StyledReactPlayer = styled(ReactPlayer)`
  position: absolute;
  top: 0;
  left: 0;
`;

const VideoInfo = styled.div`
  margin-top: 24px;
`;

const VideoTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 8px;
`;

const VideoArtist = styled.p`
  font-size: 16px;
  color: #b3b3b3;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

const Button = styled.button`
  background: #1db954;
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background: #1ed760;
  }

  &:disabled {
    background: #4f4f4f;
    cursor: not-allowed;
  }
`;

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state: { currentMedia }, play, pause } = useMediaState();
  const [video, setVideo] = useState<Media | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      
      try {
        const response = await mediaApi.getVideos();
        const foundVideo = response.data.find(v => v.id === parseInt(id));
        if (foundVideo) {
          setVideo(foundVideo);
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    fetchVideo();
  }, [id]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (video) {
      play(video);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    pause();
  };

  const handleDownload = () => {
    if (video?.video_file) {
      const link = document.createElement('a');
      link.href = video.video_file;
      link.download = `${video.title}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!video) {
    return <VideoPlayerContainer>Loading...</VideoPlayerContainer>;
  }

  return (
    <VideoPlayerContainer>
      <VideoWrapper>
        <StyledReactPlayer
          url={video.video_file}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls={true}
          onPlay={handlePlay}
          onPause={handlePause}
        />
      </VideoWrapper>
      <VideoInfo>
        <VideoTitle>{video.title}</VideoTitle>
        <VideoArtist>{video.artist}</VideoArtist>
        <ActionButtons>
          <Button onClick={handleDownload}>
            Download Video
          </Button>
        </ActionButtons>
      </VideoInfo>
    </VideoPlayerContainer>
  );
};

export default VideoPlayer;