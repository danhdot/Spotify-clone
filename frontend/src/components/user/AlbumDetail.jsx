// src/components/user/AlbumDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';
import { PlayerContext } from '../../context/PlayerContext';
import { useContext } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useContext(PlayerContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch album details
        const albumRes = await fetch(`http://127.0.0.1:8000/api/albums/${id}/`);
        const albumData = await albumRes.json();

        // Fetch all songs
        const songsRes = await fetch('http://127.0.0.1:8000/api/songs/');
        const allSongs = await songsRes.json();

        // Filter songs that belong to this album
        const albumSongs = allSongs.filter(song =>
          song.album && song.album.id === parseInt(id)
        );

        setAlbum(albumData);
        setSongs(albumSongs);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 flex items-center justify-center">
        <div className="text-white">Loading album...</div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 flex items-center justify-center">
        <div className="text-white">Album not found</div>
      </div>
    );
  }

  // Trong phần render của AlbumDetail
  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 overflow-y-auto">
      {/* Album Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="mt-1 p-2 rounded-full hover:bg-gray-800 transition"
        >
          <FaArrowLeft />
        </button>
        <img
          src={album.image}
          alt={album.title}
          className="w-48 h-48 md:w-64 md:h-64 object-cover shadow-xl rounded-md"
        />
        <div className="flex-1">
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">{album.title}</h1>
          <p className="text-gray-400">
            {album.artist_name} • {new Date(album.release_date).getFullYear()} • {songs.length} bài hát
          </p>
        </div>
      </div>

      {/* Songs List */}
      <div className="mt-8">
        <h2 className="text-white text-2xl font-bold mb-6">Danh sách bài hát</h2>
        <div className="space-y-2">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-md cursor-pointer"
              onClick={() => playTrack({
                id: song.id,
                title: song.title,
                artist: song.artists.map(a => a.name).join(', '),
                cover: song.image || album.image,
                file: song.audio_file,
                duration: song.duration || 0
              })}
            >
              <span className="text-gray-400 w-8 text-center">{index + 1}</span>
              <div className="flex-1">
                <h3 className="text-white font-medium">{song.title}</h3>
                <p className="text-gray-400 text-sm">
                  {song.artists.map(a => a.name).join(', ')}
                </p>
              </div>
              <button className="text-gray-400 hover:text-white">
                <FaPlay />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;