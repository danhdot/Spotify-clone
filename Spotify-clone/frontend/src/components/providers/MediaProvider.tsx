import React, { useState } from 'react';
import { MediaContext } from '../../services/mediaState';

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    isPlaying: false,
    volume: 1,
    progress: 0
  });

  return (
    <MediaContext.Provider value={{ state, setState }}>
      {children}
    </MediaContext.Provider>
  );
};