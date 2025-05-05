import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../../context/PlayerContext";
import { FaPlay } from "react-icons/fa";
import { fetchSongs } from "../../services/songService";
import { fetchAlbums } from "../../services/albumService";
import { Link } from "react-router-dom";

const Display = () => {
  const { playTrack } = useContext(PlayerContext);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [songsData, albumsData] = await Promise.all([
        fetchSongs(),
        fetchAlbums(),
      ]);
      setSongs(songsData);
      setAlbums(albumsData);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 flex items-center justify-center">
        <div className="text-white">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-6 overflow-y-auto">
      {/* Albums Section */}
      {albums.length > 0 && (
        <div className="mb-10">
          <h2 className="text-white text-xl font-bold mb-4">Albums</h2>
          <div className="relative group">
            <div
              className="flex space-x-6 pb-4 overflow-x-auto scrollbar-hide 
                            group-hover:scrollbar-default transition-all duration-300
                            hover:overflow-x-scroll"
            >
              {albums.map((album) => (
                <Link
                  to={`/album/${album.id}`}
                  key={album.id}
                  className="flex-shrink-0 w-48 bg-gray-800 bg-opacity-40 hover:bg-gray-700 
                           rounded-md p-4 transition cursor-pointer group/item"
                >
                  <div className="relative mb-4">
                    <img
                      src={album.image}
                      alt={album.title}
                      className="w-full aspect-square object-cover rounded-md shadow-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                  </div>
                  <h3 className="text-white font-medium truncate">
                    {album.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 truncate">
                    {new Date(album.release_date).getFullYear()}
                  </p>
                </Link>
              ))}
            </div>
            <div
              className="absolute right-0 top-0 bottom-0 w-24 
                            bg-gradient-to-l from-gray-900 to-transparent 
                            pointer-events-none opacity-0 group-hover:opacity-100 transition"
            ></div>
          </div>
        </div>
      )}

      {/* Songs Section */}
      {songs.length > 0 && (
        <div>
          <h2 className="text-white text-xl font-bold mb-4">Songs</h2>
          <div className="relative group">
            <div
              className="flex space-x-6 pb-4 overflow-x-auto scrollbar-hide 
                            group-hover:scrollbar-default transition-all duration-300
                            hover:overflow-x-scroll"
            >
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-48 bg-gray-800 bg-opacity-40 hover:bg-gray-700 
                             rounded-md p-4 transition cursor-pointer group/item"
                  onClick={() =>
                    playTrack({
                      id: song.id,
                      title: song.title,
                      artist: song.artists.map((a) => a.name).join(", "),
                      cover: song.image || song.album?.image,
                      file: song.audio_file,
                      duration: song.duration || 0,
                    })
                  }
                >
                  <div className="relative mb-4">
                    <img
                      src={song.image || song.album?.image}
                      alt={song.title}
                      className="w-full aspect-square object-cover rounded-md shadow-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                  </div>
                  <h3 className="text-white font-medium truncate">
                    {song.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 truncate">
                    {song.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
              ))}
            </div>
            <div
              className="absolute right-0 top-0 bottom-0 w-24 
                            bg-gradient-to-l from-gray-900 to-transparent 
                            pointer-events-none opacity-0 group-hover:opacity-100 transition"
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Display;
