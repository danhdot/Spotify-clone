import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import HomeIcon from '@material-ui/icons/Home';
import SearchIcon from '@material-ui/icons/Search';
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic';
import AddBoxIcon from '@material-ui/icons/AddBox';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { mediaApi } from '../../services/api'; // Import API service
import { useNavigate } from 'react-router-dom'; // To potentially navigate after creation

interface NavItemProps {
  active?: boolean;
}

const SidebarContainer = styled.div`
  width: 240px;
  background-color: #000000;
  color: #b3b3b3;
  padding: 24px 0;
  height: 100%;
`;

const Logo = styled.div`
  padding: 0 24px;
  margin-bottom: 24px;
  img {
    width: 130px;
  }
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItemStyled = styled(Link)<NavItemProps>`
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 40px;
  color: ${(props: NavItemProps) => props.active ? '#ffffff' : '#b3b3b3'};
  text-decoration: none;
  font-weight: ${(props: NavItemProps) => props.active ? '700' : '400'};
  &:hover {
    color: #ffffff;
  }
`;

const Icon = styled.span`
  margin-right: 16px;
  display: flex;
  align-items: center;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #282828;
  margin: 8px 24px;
`;

const PlaylistSection = styled.div`
  padding: 0 24px;
`;

const CreatePlaylistButton = styled.button`
  background: none;
  border: none;
  color: #b3b3b3;
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  &:hover {
    color: #ffffff;
  }
`;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation

  const handleCreatePlaylist = async () => {
    const name = window.prompt("Enter the name for your new playlist:");
    if (name && name.trim() !== '') {
      try {
        const response = await mediaApi.createPlaylist(name.trim());
        // Optional: Navigate to the new playlist page
        // navigate(`/playlist/${response.data.id}`);
        alert(`Playlist "${response.data.name}" created successfully!`);
        // TODO: Refresh playlist list in sidebar or library view
      } catch (error) {
        console.error("Error creating playlist:", error);
        alert("Failed to create playlist. Please try again.");
      }
    } else if (name !== null) { // Only alert if prompt wasn't cancelled
        alert("Playlist name cannot be empty.");
    }
  };

  return (
    <SidebarContainer>
      <Logo>
        <img src="/spotify-logo.png" alt="Spotify" />
      </Logo>
      
      <NavMenu>
        <li>
          <NavItemStyled to="/" active={location.pathname === '/'}>
            <Icon><HomeIcon /></Icon>
            Home
          </NavItemStyled>
        </li>
        <li>
          <NavItemStyled to="/search" active={location.pathname === '/search'}>
            <Icon><SearchIcon /></Icon>
            Search
          </NavItemStyled>
        </li>
        <li>
          <NavItemStyled to="/library" active={location.pathname === '/library'}>
            <Icon><LibraryMusicIcon /></Icon>
            Your Library
          </NavItemStyled>
        </li>
      </NavMenu>

      <Divider />

      <PlaylistSection>
        {/* Add onClick handler */}
        <CreatePlaylistButton onClick={handleCreatePlaylist}>
          <AddBoxIcon style={{ marginRight: '16px' }} />
          Create Playlist
        </CreatePlaylistButton>
        {/* Note: The "Liked Songs" link here might be redundant if handled in Library */}
        {/* Consider removing or linking to /library?tab=songs */}
        <NavItemStyled to="/library" active={location.pathname === '/library' && location.search.includes('tab=songs')}>
          <Icon><FavoriteIcon /></Icon>
          Liked Songs
        </NavItemStyled>
      </PlaylistSection>

      <Divider />
    </SidebarContainer>
  );
};

export default Sidebar;
