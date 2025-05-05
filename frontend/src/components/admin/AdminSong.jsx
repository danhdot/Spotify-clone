import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { url } from '../../App';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaMusic, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import Fuse from 'fuse.js';

function AdminSong() {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [songSearch, setSongSearch] = useState('');
  const songsPerPage = 4;

  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/songs/?expand=albums,artist`);
      if (response.status === 200) {
        setSongs(response.data);
        setFilteredSongs(response.data); // Initialize filteredSongs with all songs
        console.log(response.data);
      }
    } catch (error) {
      toast.error('Unable to load songs');
      console.error('Error fetching songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSong = async (id, songTitle) => {
    if (window.confirm(`Are you sure you want to delete "${songTitle}"?`)) {
      try {
        await toast.promise(
          axios.delete(`${url}/api/songs/${id}/`),
          {
            pending: 'Deleting song...',
            success: 'Song deleted successfully',
            error: 'Delete song failed'
          }
        );
        await fetchSongs();
        // Reset to first page if current page becomes empty
        const totalPages = Math.ceil(filteredSongs.length / songsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Fuzzy search with fuse.js
  useEffect(() => {
    if (songSearch.trim() === '') {
      setFilteredSongs(songs); // Show all songs if search is empty
    } else {
      const fuse = new Fuse(songs, {
        keys: ['title', 'artists.name'], // Search in title, album title, and artist names
        includeScore: true,
        threshold: 0.5, // Moderate fuzziness (0.0 = exact, 1.0 = very loose)
        ignoreLocation: true, // Match anywhere in the string
        minMatchCharLength: 1, // Start matching with 1 character
      });
      const results = fuse.search(songSearch).map(result => result.item);
      setFilteredSongs(results);
    }
  }, [songSearch, songs]);

  // Pagination logic
  const totalSongs = filteredSongs.length;
  const totalPages = Math.ceil(totalSongs / songsPerPage);
  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = filteredSongs.slice(indexOfFirstSong, indexOfLastSong);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-3 py-1 mx-1 rounded-full ${
            currentPage === i
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } transition`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-500 flex items-center">
          <FaMusic className="mr-3" /> Song Management
        </h1>
        <Link
          to="/admin/add-song"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full flex items-center transition"
        >
          <FaPlus className="mr-2" /> Add New Song
        </Link>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          value={songSearch}
          onChange={(e) => setSongSearch(e.target.value)}
          placeholder="Search songs by title, or artist..."
          className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-100"
        />
      </div>

      {/* Song Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            Loading song list...
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No songs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left">Avatar</th>
                  <th className="px-6 py-4 text-left">Song name</th>
                  {/* <th className="px-6 py-4 text-left">Album</th> */}
                  <th className="px-6 py-4 text-left">Artists</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentSongs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-750 transition">
                    <td className="px-6 py-4">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded object-cover"
                          src={song.image}
                          alt={song.title}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{song.title}</div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-400">
                        {song.album ? `${song.album.id} [ ${song.album.title} ]` : 'No Album'}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-400">
                        {song.artists && song.artists.length > 0
                          ? song.artists.map(artist => artist.name).join(', ')
                          : 'No Artists'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/admin/songs/${song.id}`}
                          className="text-blue-400 hover:text-blue-300 transition"
                          title="Edit"
                        >
                          <FaEdit className="inline mr-1" />
                        </Link>
                        <button
                          onClick={() => removeSong(song.id, song.title)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Delete"
                        >
                          <FaTrash className="inline mr-1" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-300 transition">
                          <FiMoreVertical />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-full ${
              currentPage === 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } transition`}
          >
            Previous
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-full ${
              currentPage === totalPages
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } transition`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminSong;