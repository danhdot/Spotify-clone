import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTrash, FaEdit, FaPlay } from 'react-icons/fa';
import { url } from '../App';
import { useAuth } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import { fetchSongs } from '../services/songService';

const Playlist = () => {
  const { playTrack } = useContext(PlayerContext);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [editPlaylistId, setEditPlaylistId] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchPlaylists();
      const songsData = await fetchSongs();
      setAvailableSongs(songsData);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchPlaylists = async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${url}/api/playlists/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setPlaylists(data);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${url}/api/playlists/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playlistName, user: user.id }),
      });
      if (response.ok) {
        const newPlaylist = await response.json();
        setPlaylists((prev) => [...prev, newPlaylist]);
        setPlaylistName('');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${url}/api/playlists/${playlistId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const handleEditPlaylist = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${url}/api/playlists/${editPlaylistId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editPlaylistName }),
      });
      if (response.ok) {
        const updatedPlaylist = await response.json();
        setPlaylists((prev) =>
          prev.map((p) => (p.id === editPlaylistId ? updatedPlaylist : p))
        );
        setEditPlaylistName('');
        setEditPlaylistId(null);
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error editing playlist:', error);
    }
  };

  const handleAddSong = async (playlistId, songId) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${url}/api/playlists/${playlistId}/songs/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song_id: songId }),
      });
      if (response.ok) {
        const updatedPlaylist = await response.json();
        setPlaylists((prev) =>
          prev.map((p) => (p.id === playlistId ? updatedPlaylist : p))
        );
        setSelectedSongId(null);
        setSearchQuery('');
        setIsSongModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  const getAvailableSongsForPlaylist = (playlistId) => {
    const currentPlaylist = playlists.find((p) => p.id === playlistId);
    if (!currentPlaylist || !currentPlaylist.songs) return availableSongs;
    const currentSongIds = currentPlaylist.songs.map((song) => song.id);
    let filteredSongs = availableSongs.filter((song) => !currentSongIds.includes(song.id));
    if (searchQuery) {
      filteredSongs = filteredSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artists.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filteredSongs;
  };

  const getPlaylistImage = (playlist) => {
    return playlist.songs.length > 0 && playlist.songs[0].image
      ? `${url}${playlist.songs[0].image}`
      : `${url}/media/songs/default-playlist.png`; // Custom default image for empty playlists
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 flex items-center justify-center">
        <div className="text-white">Loading playlists...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 overflow-y-auto">
      <div className =  "stairway-to-heaven mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Playlists</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1DB954] text-black px-4 py-2 rounded-full hover:bg-[#1ed760] transition"
          >
            <FaPlus size={16} />
            <span>Create Playlist</span>
          </button>
        </div>
        <div className="relative group">
          <div className="flex space-x-6 pb-4 overflow-x-auto scrollbar-hide group-hover:scrollbar-default transition-all duration-300 hover:overflow-x-scroll">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex-shrink-0 w-48 bg-gray-800 bg-opacity-40 hover:bg-gray-700 rounded-md p-4 transition cursor-pointer group/item relative"
              >
                <div className="relative mb-4">
                  <img
                    src={getPlaylistImage(playlist)}
                    alt={playlist.name}
                    className="w-full aspect-square object-cover rounded-md shadow-lg"
                    onError={(e) => {
                      e.target.src = '/default-playlist.png';
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (playlist.songs.length > 0) {
                        const firstSong = playlist.songs[0];
                        playTrack({
                          id: firstSong.id,
                          title: firstSong.title,
                          artist: firstSong.artists?.map((a) => a.name).join(', ') || 'Unknown Artist',
                          cover: firstSong.image ? `${url}${firstSong.image}` : '/default-playlist.png',
                          file: `${url}${firstSong.audio_file}`,
                          duration: firstSong.duration,
                        });
                      }
                    }}
                    className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover/item:opacity-100 transition hover:scale-105"
                  >
                    <FaPlay size={16} className="text-black" />
                  </button>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/item:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPlaylistId(playlist.id);
                        setEditPlaylistName(playlist.name);
                        setIsEditModalOpen(true);
                      }}
                      className="text-[#B3B3B3] hover:text-white"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                      className="text-[#B3B3B3] hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPlaylistId(playlist.id);
                        setIsSongModalOpen(true);
                      }}
                      className="text-[#B3B3B3] hover:text-[#1DB954]"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-medium truncate">{playlist.name}</h3>
                <p className="text-gray-400 text-sm mt-1 truncate">{playlist.songs.length} songs</p>
              </div>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition"></div>
        </div>
      </div>

      {/* Modal tạo playlist */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#282828] p-6 rounded-lg w-11/12 max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create Playlist</h2>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="w-full p-2 bg-[#181818] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#1DB954] mb-4"
                placeholder="Playlist name"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#B3B3B3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1DB954] text-black px-4 py-2 rounded-full hover:bg-[#1ed760] transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa tên playlist */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#282828] p-6 rounded-lg w-11/12 max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Edit Playlist</h2>
            <form onSubmit={handleEditPlaylist}>
              <input
                type="text"
                value={editPlaylistName}
                onChange={(e) => setEditPlaylistName(e.target.value)}
                className="w-full p-2 bg-[#181818] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#1DB954] mb-4"
                placeholder="New playlist name"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-[#B3B3B3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1DB954] text-black px-4 py-2 rounded-full hover:bg-[#1ed760] transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm bài hát */}
      {isSongModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#282828] p-6 rounded-lg w-11/12 max-w-lg">
            <h2 className="text-xl font-bold text-white mb-4">Add Song to Playlist</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 bg-[#181818] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#1DB954] mb-4"
              placeholder="Search songs or artists..."
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {getAvailableSongsForPlaylist(editPlaylistId).length > 0 ? (
                getAvailableSongsForPlaylist(editPlaylistId).map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleAddSong(editPlaylistId, song.id)}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedSongId === song.id ? 'bg-green-900' : 'hover:bg-gray-700'
                    }`}
                  >
                    {/* <img
                      src={song.image ? `${url}${song.image}` : '/default-playlist.png'}
                      alt={song.title}
                      className="w-12 h-12 object-cover rounded-md"
                      onError={(e) => (e.target.src = '/default-playlist.png')}
                    /> */}
                    <div className="flex-1">
                      <h3 className="text-white font-medium truncate">{song.title}</h3>
                      <p className="text-gray-400 text-sm truncate">
                        {song.artists?.map((a) => a.name).join(', ') || 'Unknown Artist'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  {searchQuery ? 'No songs found' : 'All songs already added'}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsSongModalOpen(false)}
                className="text-[#B3B3B3] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlist;