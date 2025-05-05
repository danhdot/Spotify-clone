import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch, FaTimes, FaPlay } from 'react-icons/fa';
import { PlayerContext } from '../../context/PlayerContext';
import Fuse from 'fuse.js';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playTrack, track } = useContext(PlayerContext);

  // Fetch all songs on component mount or when searchParams change
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/songs/');
        if (!response.ok) throw new Error(`API failed: ${response.status}`);
        const data = await response.json();
        setResults(data);
        setFilteredResults(data);
      } catch (error) {
        console.error('Error fetching songs:', error.message);
      } finally {
        setLoading(false);
      }
    };

    const urlQuery = searchParams.get('q');
    setQuery(urlQuery || '');
    fetchSongs();
  }, [searchParams]);

  // Fuzzy search with Fuse.js
  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults(results);
    } else {
      const fuse = new Fuse(results, {
        keys: ['title', 'artists.name', 'album.title'],
        includeScore: true,
        threshold: 0.5,
        ignoreLocation: true,
        minMatchCharLength: 1,
      });
      const fuzzyResults = fuse.search(query).map(result => result.item);
      setFilteredResults(fuzzyResults);
    }
  }, [query, results]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    navigate(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : '/search');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const clearSearch = () => {
    setQuery('');
    navigate('/search');
  };

  const handlePlaySong = (song) => {
    playTrack({
      id: song.id,
      title: song.title,
      artist: song.artists?.map((a) => a.name).join(', ') || 'Unknown Artist',
      cover: song.image || 'https://via.placeholder.com/300',
      file: song.audio_file,
      duration: song.duration,
    });
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search songs, artists, or albums..."
              className="w-full bg-gray-800 text-white rounded-full py-3 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </form>

        {/* Search Results */}
        {loading ? (
          <div className="text-center text-gray-400 py-10">Đang tải...</div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-white text-xl font-bold">
              {query ? 'Kết quả tìm kiếm' : 'Tất cả bài hát'}
            </h2>
            {filteredResults.map((song) => (
              <div
                key={song.id}
                className={`flex items-center gap-4 p-3 rounded-md cursor-pointer transition-colors ${
                  track && track.id === song.id ? 'bg-green-900' : 'hover:bg-gray-800'
                }`}
                onClick={() => handlePlaySong(song)}
              >
                <img
                  src={song.image || 'https://via.placeholder.com/300'}
                  alt={song.title}
                  className="w-16 h-16 object-cover rounded-md"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/300')}
                />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{song.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {song.artists?.map((a) => a.name).join(', ') || 'Unknown Artist'}
                  </p>
                  {song.album && (
                    <p className="text-gray-500 text-xs mt-1">{song.album.title}</p>
                  )}
                </div>
                <FaPlay className="text-gray-400 hover:text-green-500" aria-label={`Phát ${song.title}`} />
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center text-gray-400 py-10">
            Không tìm thấy kết quả cho "{query}"
          </div>
        ) : (
          <div className="text-center text-gray-400 py-10">
            Không có bài hát nào
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;