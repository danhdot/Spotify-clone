import React, { useState, useEffect } from "react";
import axios from "axios";
import Fuse from "fuse.js";
import { FaUserAlt } from "react-icons/fa";

function AdminArtist() {
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [newArtist, setNewArtist] = useState({ name: "" });
  const [editArtist, setEditArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [artistSearch, setArtistSearch] = useState("");
  const artistsPerPage = 4;

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8000/api/artists/");
      setArtists(response.data);
      setFilteredArtists(response.data); // Initialize filtered artists
      setError(null);
    } catch (err) {
      console.error("Error fetching artists:", err);
      setError("Unable to load artist list");
    } finally {
      setIsLoading(false);
    }
  };

  const addArtist = async () => {
    if (!newArtist.name.trim()) return;

    try {
      const response = await axios.post(
        "http://localhost:8000/api/artists/",
        newArtist
      );
      const updatedArtists = [...artists, response.data];
      setArtists(updatedArtists);
      setFilteredArtists(updatedArtists); // Update filtered artists
      setNewArtist({ name: "" });
    } catch (err) {
      console.error("Error adding artist:", err);
      setError("Error adding artist");
    }
  };

  const deleteArtist = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete artist "${name}" ?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/artists/${id}/`);
        const updatedArtists = artists.filter((artist) => artist.id !== id);
        setArtists(updatedArtists);
        setFilteredArtists(
          filteredArtists.filter((artist) => artist.id !== id)
        );
        // Reset to previous page if current page becomes empty
        const totalPages = Math.ceil(updatedArtists.length / artistsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } catch (err) {
        console.error("Error deleting artist:", err);
        setError("Error deleting artist");
      }
    }
  };

  const updateArtist = async () => {
    if (!editArtist?.name.trim()) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/api/artists/${editArtist.id}/`,
        editArtist
      );
      const updatedArtists = artists.map((artist) =>
        artist.id === editArtist.id ? response.data : artist
      );
      setArtists(updatedArtists);
      setFilteredArtists(updatedArtists); // Update filtered artists
      setEditArtist(null);
    } catch (err) {
      console.error("Error updating artist:", err);
      setError("Error updating artist");
    }
  };

  // Fuzzy search for artists
  useEffect(() => {
    if (!artistSearch.trim()) {
      setFilteredArtists(artists); // Show all artists if search is empty
    } else {
      const fuse = new Fuse(artists, {
        keys: ["name"],
        includeScore: true,
        threshold: 0.5,
        ignoreLocation: true,
        minMatchCharLength: 1,
      });
      const results = fuse.search(artistSearch).map((result) => result.item);
      setFilteredArtists(results);
    }
  }, [artistSearch, artists]);

  // Pagination logic
  const totalArtists = filteredArtists.length;
  const totalPages = Math.ceil(totalArtists / artistsPerPage);
  const indexOfLastArtist = currentPage * artistsPerPage;
  const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
  const currentArtists = filteredArtists.slice(
    indexOfFirstArtist,
    indexOfLastArtist
  );

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
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          } transition`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-500 flex items-center">
          <FaUserAlt className="mr-3" /> Artist Management
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compact Add Artist Form */}
        <div
          className="bg-gray-800 p-4 rounded-lg shadow-lg"
          style={{ height: "fit-content" }}
        >
          <h2 className="text-lg font-semibold mb-3 text-green-400">
            Add Artist
          </h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newArtist.name}
              onChange={(e) =>
                setNewArtist({ ...newArtist, name: e.target.value })
              }
              placeholder="Artist name"
              className="flex-1 px-3 py-1.5 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={addArtist}
              disabled={!newArtist.name.trim()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm transition disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Artist List */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-400">
              List of Artists
            </h2>
            {isLoading && (
              <div className="text-sm text-gray-400">Loading...</div>
            )}
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
              placeholder="Search artists by name..."
              className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-100"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 text-red-100 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {currentArtists.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-gray-400">
                {artistSearch ? "No artists found" : "No artists added yet"}
              </div>
            ) : (
              currentArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex justify-between items-center p-4 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  <div>
                    <h3 className="font-medium">{artist.name}</h3>
                    {/* <p className="text-sm text-gray-400 line-clamp-1">
                      {artist.bio || "No bio available"}
                    </p> */}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditArtist({ ...artist })}
                      className="p-2 text-gray-300 hover:text-green-400 transition"
                      title="Edit"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteArtist(artist.id, artist.name)}
                      className="p-2 text-gray-300 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
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
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
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
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } transition`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Artist Modal */}
      {editArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-green-400">
              Edit Artist
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editArtist.name}
                  onChange={(e) =>
                    setEditArtist({ ...editArtist, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={updateArtist}
                  disabled={!editArtist.name.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition disabled:opacity-50"
                >
                  Update
                </button>
                <button
                  onClick={() => setEditArtist(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminArtist;
