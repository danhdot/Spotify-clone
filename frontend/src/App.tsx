import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MediaProvider } from './components/providers/MediaProvider';
import styled from 'styled-components';
import Sidebar from './components/layout/Sidebar';
import Player from './components/layout/Player';
import Home from './components/layout/Home';
import Library from './components/music/Library';
import Search from './components/layout/Search';
import Playlist from './components/playlist/Playlist';
import VideoPlayer from './components/video/VideoPlayer';

const AppContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100vh;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  overflow: hidden;
`;

const ContentArea = styled.main`
  overflow-y: auto;
  background: #121212;
  color: white;
`;

function App() {
  return (
    <MediaProvider>
      <Router>
        <AppContainer>
          <MainContent>
            <Sidebar />
            <ContentArea>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/playlist/:id" element={<Playlist />} />
                <Route path="/video/:id" element={<VideoPlayer />} />
              </Routes>
            </ContentArea>
          </MainContent>
          <Player />
        </AppContainer>
      </Router>
    </MediaProvider>
  );
}

export default App;