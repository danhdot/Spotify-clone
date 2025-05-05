import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaPlayCircle, FaPauseCircle, FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { url } from '../App';
import { useAuth } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import { fetchSongs } from '../services/songService';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Thêm useNavigate để chuyển hướng sau khi xóa
  const { user } = useAuth();
  const {
    isPlaying,
    togglePlay,
    track,
    playTrack,
  } = useContext(PlayerContext);
  const [playlist, setPlaylist] = useState(null);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await fetchPlaylist();
      const songsData = await fetchSongs();
      setAvailableSongs(songsData);
      setLoading(false);
    };
    loadData();
  }, [id]);

  const fetchPlaylist = async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${url}/api/playlists/${id}/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setPlaylist(data);
      setEditPlaylistName(data.name); // Khởi tạo tên playlist để chỉnh sửa
    }
  };

  const handleEditPlaylist = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${url}/api/playlists/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editPlaylistName }),
      });
      if (response.ok) {
        const updatedPlaylist = await response.json();
        setPlaylist(updatedPlaylist);
        setIsEditModalOpen(false);
      } else {
        console.error('Error editing playlist:', await response.json());
      }
    } catch (error) {
      console.error('Error editing playlist:', error);
    }
  };

  const handleDeletePlaylist = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${url}/api/playlists/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        navigate('/playlists'); // Chuyển hướng về danh sách playlist sau khi xóa
      } else {
        console.error('Error deleting playlist:', await response.statusText);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const handleAddSong = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${url}/api/playlists/${id}/songs/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song_id: selectedSongId }),
      });
      if (response.ok) {
        const updatedPlaylist = await response.json();
        setPlaylist(updatedPlaylist);
        setSelectedSongId(null);
        setSearchQuery('');
        setIsSongModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  const handleRemoveSong = async (songId) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${url}/api/playlists/${id}/songs/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song_id: songId }),
      });
      if (response.ok) {
        const updatedPlaylist = await response.json();
        setPlaylist(updatedPlaylist);
      }
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const getAvailableSongs = () => {
    if (!playlist || !playlist.songs) return availableSongs;
    const currentSongIds = playlist.songs.map((song) => song.id);
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

  const formatDuration = (duration) => {
    const seconds = Math.floor((new Date(duration) - new Date(0)) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handlePlaySong = (song) => {
    const songUrl = `${url}${song.audio_file}`;
    if (track === songUrl && isPlaying) {
      togglePlay();
    } else {
      playTrack(songUrl);
    }
  };

  const getPlaylistImage = () => {
    return playlist?.songs.length > 0 && playlist.songs[0].image
      ? `${url}${playlist.songs[0].image}`
      : 'https://via.placeholder.com/300';
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 flex items-center justify-center">
        <div className="text-white">Loading playlist...</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 flex items-center justify-center">
        <div className="text-white">Playlist not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <img
          src={getPlaylistImage()}
          alt={playlist.name}
          className="w-48 h-48 object-cover rounded-md shadow-lg"
        />
        <div>
          <Link to="/playlists" className="text-[#B3B3B3] hover:text-white mb-2 inline-block">
            ← Back to Playlists
          </Link>
          <h1 className="text-4xl font-bold text-white">{playlist.name}</h1>
          <p className="text-gray-400 mt-2">{playlist.songs.length} songs</p>
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => handlePlaySong(playlist.songs[0])}
              className="bg-[#1DB954] text-black rounded-full p-4 hover:bg-[#1ed760] transition"
              disabled={playlist.songs.length === 0}
            >
              <FaPlayCircle size={24} />
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[#B3B3B3] hover:text-white"
            >
              <FaEdit size={20} />
            </button>
            <button
              onClick={handleDeletePlaylist}
              className="text-[#B3B3B3] hover:text-red-500"
            >
              <FaTrash size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="text-[#B3B3B3] mb-4">
        <div className="grid grid-cols-[0.2fr_2fr_1fr_1fr_0.5fr_0.2fr] gap-4 text-sm font-semibold border-b border-[#282828] pb-2">
          <span></span>
          <span>Title</span>
          {/* <span>Artist</span> */}
          <span>Album</span>
          {/* <span>Duration</span> */}
          <span></span>
        </div>
        {playlist.songs.length > 0 ? (
          playlist.songs.map((song) => (
            <div
              key={song.id}
              className="grid grid-cols-[0.2fr_2fr_1fr_1fr_0.5fr_0.2fr] gap-4 py-2 hover:bg-[#282828] rounded transition items-center group"
            >
              <button
                onClick={() => handlePlaySong(song)}
                className="text-[#B3B3B3] hover:text-[#1DB954]"
              >
                {isPlaying && track === `${url}${song.audio_file}` ? (
                  <FaPauseCircle />
                ) : (
                  <FaPlayCircle />
                )}
              </button>
              <span className="text-white truncate">{song.title}</span>
              {/* <span className="truncate">{song.artists.map((a) => a.name).join(', ')}</span> */}
              <span className="truncate">{song.album?.title || 'N/A'}</span>
              {/* <span>{formatDuration(song.duration)}</span> */}
              <button
                onClick={() => handleRemoveSong(song.id)}
                className="text-[#B3B3B3] hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-[#B3B3B3] mt-4">No songs yet. Add some!</p>
        )}
      </div>

      <button
        onClick={() => setIsSongModalOpen(true)}
        className="mt-4 flex items-center gap-2 bg-[#1DB954] text-black px-4 py-2 rounded-full hover:bg-[#1ed760] transition"
      >
        <FaPlus size={16} />
        <span>Add Song</span>
      </button>

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

      {/* Modal thêm bài hát
      {isSongModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#282828] p-6 rounded-lg w-11/12 max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add Song to Playlist</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 bg-[#181818] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#1DB954] mb-4"
              placeholder="Search songs..."
            />
            <form onSubmit={(e) => { e.preventDefault(); handleAddSong(); }}>
              <select
                value={selectedSongId || ''}
                onChange={(e) => setSelectedSongId(e.target.value)}
                className="w-full p-2 bg-[#181818] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#1DB954] mb-4 max-h-40 overflow-y-auto"
                size="5"
              >
                {getAvailableSongs().length > 0 ? (
                  getAvailableSongs().map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.title} - {song.artists.map((a) => a.name).join(', ')}
                    </option>
                  ))
                ) : (
                  <option disabled>No songs found</option>
                )}
              </select>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSongModalOpen(false)}
                  className="text-[#B3B3B3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1DB954] text-black px-4 py-2 rounded-full hover:bg-[#1ed760] transition"
                  disabled={!selectedSongId}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      {isSongModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#2A2A2A] p-6 rounded-xl w-full max-w-lg shadow-lg transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-semibold text-white">Add Song to Playlist</h2>
              <button
                onClick={() => setIsSongModalOpen(false)}
                className="text-[#B3B3B3] hover:text-white focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-[#1F1F1F] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954] placeholder-[#B3B3B3] transition-all duration-200"
              placeholder="Search for a song..."
            />

            <form onSubmit={(e) => { e.preventDefault(); handleAddSong(); }} className="mt-4">
              <select
                value={selectedSongId || ''}
                onChange={(e) => setSelectedSongId(e.target.value)}
                className="w-full p-3 bg-[#1F1F1F] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954] max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1DB954] scrollbar-track-[#282828] transition-all duration-200"
                size="5"
              >
                {getAvailableSongs().length > 0 ? (
                  getAvailableSongs().map((song) => (
                    <option
                      key={song.id}
                      value={song.id}
                      className="py-2 px-3 hover:bg-[#333333] transition-colors duration-150"
                    >
                      {song.title}
                    </option>
                  ))
                ) : (
                  <option disabled className="text-[#B3B3B3]">No songs found</option>
                )}
              </select>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSongModalOpen(false)}
                  className="text-[#B3B3B3] hover:text-white font-medium px-4 py-2 rounded-full transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1DB954] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#1ED760] disabled:bg-[#166D3B] disabled:cursor-not-allowed transition-all duration-200"
                  disabled={!selectedSongId}
                >
                  Add Song
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlaylistDetail;