import { createContext, useContext } from 'react';

interface MediaState {
  currentMedia?: Media;
  playlist?: Playlist;
  isPlaying: boolean;
  volume: number;
  progress: number;
}

interface MediaContextType {
  state: MediaState;
  setState: React.Dispatch<React.SetStateAction<MediaState>>;
}

const defaultState: MediaState = {
  isPlaying: false,
  volume: 1,
  progress: 0
};

export const MediaContext = createContext<MediaContextType>({
  state: defaultState,
  setState: () => {}
});

export const useMediaContext = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMediaContext must be used within a MediaProvider');
  }
  return context;
};