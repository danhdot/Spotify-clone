import React, { useState } from 'react';
import { MediaContext } from '../../services/mediaState';

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    isPlaying: false,
    volume: 1,
    progress: 0
  });

  const play = (media: Media) => {
    setState(prevState => ({
      ...prevState,
      currentMedia: media,
      isPlaying: true
    }));
  };

  const pause = () => {
    setState(prevState => ({
      ...prevState,
      isPlaying: false
    }));
  };

  const next = () => {
    // Implement next functionality
  };

  const previous = () => {
    // Implement previous functionality
  };

  const setVolume = (volume: number) => {
    setState(prevState => ({
      ...prevState,
      volume: volume
    }));
  };

  const setProgress = (progress: number) => {
    setState(prevState => ({
      ...prevState,
      progress: progress
    }));
  };

  return (
    <MediaContext.Provider value={{ state, setState, play, pause, next, previous, setVolume, setProgress }}>
      {children}
    </MediaContext.Provider>
  );
};
