import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import ShuffleIcon from '@material-ui/icons/Shuffle';
import RepeatIcon from '@material-ui/icons/Repeat';
import { useMediaState } from '../../services/mediaState';
import { mediaApi } from '../../services/api';

interface ProgressBarProps {
  width: number;
}

interface ButtonProps {
  active?: boolean;
}

const PlayerContainer = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  background: #181818;
  border-top: 1px solid #282828;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  z-index: 100;
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ProgressBar = styled.div<ProgressBarProps>`
  width: 100%;
  height: 4px;
  background: ${(props: ProgressBarProps) => props.width > 0 ? '#1db954' : '#4f4f4f'};
  border-radius: 2px;
  cursor: pointer;
  position: relative;
`;

const Progress = styled.div<ProgressBarProps>`
  height: 100%;
  width: ${(props: ProgressBarProps) => props.width}%;
  background: #1db954;
  border-radius: 2px;
`;

const Button = styled.button<ButtonProps>`
  background: none;
  border: none;
  color: ${(props: ButtonProps) => props.active ? '#1db954' : '#b3b3b3'};
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: white;
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const VolumeBar = styled.div`
  width: 100px;
  height: 4px;
  background: #4f4f4f;
  border-radius: 2px;
  position: relative;
`;

const VolumeFill = styled.div<ProgressBarProps>`
  height: 100%;
  width: ${(props: ProgressBarProps) => props.width}%;
  background: #1db954;
  border-radius: 2px;
`;

const Player: React.FC = () => {
  const { 
    state: { currentMedia, isPlaying, volume, progress },
    play,
    pause,
    next,
    previous,
    setVolume,
    setProgress,
    setState
  } = useMediaState();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentMedia]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
      setProgress(percent * 100);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newVolume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const play = async (media: Media) => {
    if (media.type === 'song') {
      try {
        const response = await mediaApi.getSong(media.id);
        setState((prevState: any) => ({
          ...prevState,
          currentMedia: response.data,
          isPlaying: true
        }));
      } catch (error) {
        console.error("Error fetching song details:", error);
      }
    } else {
      setState((prevState: any) => ({
        ...prevState,
        currentMedia: media,
        isPlaying: true
      }));
    }
  };

  return (
    <PlayerContainer>
      <NowPlaying>
        {currentMedia && (
          <>
            <img
              src={currentMedia.cover_image || currentMedia.thumbnail}
              alt={currentMedia.title}
              style={{ width: 56, height: 56, borderRadius: 4 }}
            />
            <div>
              <div>{currentMedia.title}</div>
              <div style={{ color: '#b3b3b3' }}>{currentMedia.artist}</div>
            </div>
          </>
        )}
      </NowPlaying>

      <Controls>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Button onClick={previous}>
            <SkipPreviousIcon />
          </Button>
          <Button onClick={() => isPlaying ? pause() : play(currentMedia!)}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </Button>
          <Button onClick={next}>
            <SkipNextIcon />
          </Button>
        </div>
        <ProgressBar width={progress} onClick={handleProgressClick}>
          <Progress width={progress} />
        </ProgressBar>
      </Controls>

      <VolumeControl onClick={handleVolumeChange}>
        <VolumeUpIcon />
        <VolumeBar>
          <VolumeFill width={volume * 100} />
        </VolumeBar>
      </VolumeControl>

      {currentMedia?.audio_file && (
        <audio
          ref={audioRef}
          src={currentMedia.audio_file}
          onTimeUpdate={handleTimeUpdate}
          onEnded={next}
        />
      )}
    </PlayerContainer>
  );
};

export default Player;
