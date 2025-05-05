import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCompactDisc,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMusic,
} from "react-icons/fa";
import Fuse from "fuse.js";
import { toast } from "react-toastify";

function AdminAlbum() {
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [newAlbum, setNewAlbum] = useState({
    title: "",
    artist: "",
    release_date: new Date().toISOString().split("T")[0],
    image: null,
  });
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [addingSongsToAlbum, setAddingSongsToAlbum] = useState(null);
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [albumSearch, setAlbumSearch] = useState("");
  const [songSearch, setSongSearch] = useState("");
  const [isSubmittingSongs, setIsSubmittingSongs] = useState(false);
  const albumsPerPage = 4;

  useEffect(() => {
    fetchAlbums();
    fetchArtists();
    fetchSongs();
  }, []);

  const fetchAlbums = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8000/api/albums/");
      const albumsWithSongs = response.data.map((album) => ({
        ...album,
        songs: Array.isArray(album.songs) ? album.songs : [],
      }));
      setAlbums(albumsWithSongs);
      setFilteredAlbums(albumsWithSongs); // Initialize filtered albums
      // console.log("Fetched Albums:", albumsWithSongs);
    } catch (error) {
      toast.error("Không thể tải danh sách album");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/artists/");
      setArtists(response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách nghệ sĩ");
      console.error(error);
    }
  };

  const fetchSongs = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/songs/");
      setSongs(response.data);
      // console.log("Fetched Songs:", response.data);
    } catch (error) {
      toast.error("Không thể tải danh sách bài hát");
      console.error(error);
    }
  };

  const fetchSongsInAlbum = async (albumId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/songs/`);
      const songs = response.data;
      // Songs that are in the current album
      const songsInAlbum = songs.filter(
        (song) => song.album && song.album.id === albumId
      );
      // Set selected song IDs for songs already in the album
      setSelectedSongIds(songsInAlbum.map((song) => song.id));
      console.log("Fetched Songs in Album:", songsInAlbum);
      return songsInAlbum;
    } catch (error) {
      toast.error("Không thể tải danh sách bài hát trong album");
      console.error(error);
      return [];
    }
  };

  const addAlbum = async () => {
    if (!newAlbum.title.trim()) {
      toast.warning("Vui lòng nhập tên album");
      return;
    }
    try {
      setIsAdding(true);
      const formData = new FormData();
      formData.append("title", newAlbum.title);
      formData.append("artist", newAlbum.artist);
      formData.append("release_date", newAlbum.release_date);
      if (newAlbum.image) {
        formData.append("image", newAlbum.image);
      }
      const response = await axios.post(
        "http://localhost:8000/api/albums/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const newAlbumData = { ...response.data, songs: response.data.songs || [] };
      setAlbums([...albums, newAlbumData]);
      setFilteredAlbums([...filteredAlbums, newAlbumData]);
      toast.success("Thêm album thành công");
      setNewAlbum({
        title: "",
        artist: "",
        release_date: new Date().toISOString().split("T")[0],
        image: null,
      });
    } catch (error) {
      toast.error("Thêm album thất bại");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const deleteAlbum = async (id, albumTitle) => {
    if (window.confirm(`Bạn có chắc muốn xóa album "${albumTitle}"?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/albums/${id}/`);
        setAlbums(albums.filter((album) => album.id !== id));
        setFilteredAlbums(filteredAlbums.filter((album) => album.id !== id));
        fetchSongs();
        const totalPages = Math.ceil((filteredAlbums.length - 1) / albumsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
        toast.success("Xóa album thành công");
      } catch (error) {
        toast.error("Xóa album thất bại");
        console.error(error);
      }
    }
  };

  const handleFileChange = (e) => {
    if (editingAlbum) {
      setEditingAlbum({ ...editingAlbum, image: e.target.files[0] });
    } else {
      setNewAlbum({ ...newAlbum, image: e.target.files[0] });
    }
  };

  const startEditing = (album) => {
    setEditingAlbum({
      ...album,
      release_date: new Date(album.release_date).toISOString().split("T")[0],
    });
  };

  const cancelEditing = () => {
    setEditingAlbum(null);
  };

  const updateAlbum = async () => {
    if (!editingAlbum.title.trim()) {
      toast.warning("Vui lòng nhập tên album");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("title", editingAlbum.title);
      formData.append("artist", editingAlbum.artist);
      formData.append("release_date", editingAlbum.release_date);
      if (editingAlbum.image && typeof editingAlbum.image !== "string") {
        formData.append("image", editingAlbum.image);
      }
      const response = await axios.put(
        `http://localhost:8000/api/albums/${editingAlbum.id}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const updatedAlbum = { ...response.data, songs: response.data.songs || [] };
      setAlbums(
        albums.map((album) =>
          album.id === editingAlbum.id ? updatedAlbum : album
        )
      );
      setFilteredAlbums(
        filteredAlbums.map((album) =>
          album.id === editingAlbum.id ? updatedAlbum : album
        )
      );
      setEditingAlbum(null);
      toast.success("Cập nhật album thành công");
    } catch (error) {
      toast.error("Cập nhật album thất bại");
      console.error(error);
    }
  };

  const startAddingSongs = (album) => {
    setAddingSongsToAlbum(album);
    fetchSongsInAlbum(album.id).then((songsInAlbum) => {
      setSelectedSongIds(songsInAlbum.map((song) => song.id));
      console.log("Fetched Songs in Album:", songsInAlbum);
    });
    setSongSearch("");
  };

  const cancelAddingSongs = () => {
    setAddingSongsToAlbum(null);
    setSelectedSongIds([]);
    setSongSearch("");
  };

  const addSongsToAlbum = async () => {
    if (!selectedSongIds.length) {
      toast.warning("Vui lòng chọn ít nhất một bài hát");
      return;
    }
    if (
      !window.confirm(
        `Bạn có chắc muốn cập nhật danh sách bài hát cho album "${addingSongsToAlbum.title}"?`
      )
    ) {
      return;
    }
    try {
      setIsSubmittingSongs(true);
      const response = await axios.put(
        `http://localhost:8000/api/albums/${addingSongsToAlbum.id}/add_songs/`,
        { song_ids: selectedSongIds },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.message) {
        // Case 1: Song list is unchanged
        toast.info(response.data.message);
      } else {
        // Case 2: Song list updated
        const updatedAlbum = { ...response.data, songs: response.data.songs || [] };
        setAlbums(
          albums.map((album) =>
            album.id === addingSongsToAlbum.id ? updatedAlbum : album
          )
        );
        setFilteredAlbums(
          filteredAlbums.map((album) =>
            album.id === addingSongsToAlbum.id ? updatedAlbum : album
          )
        );
        fetchSongs();
        toast.success("Cập nhật bài hát trong album thành công");
      }
      cancelAddingSongs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Cập nhật bài hát thất bại");
      console.error(error);
    } finally {
      setIsSubmittingSongs(false);
    }
  };

  const handleSongSelection = (songId) => {
    setSelectedSongIds((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  // Fuzzy search for albums
  useEffect(() => {
    if (!albumSearch.trim()) {
      setFilteredAlbums(albums); // Show all albums if search is empty
    } else {
      const fuse = new Fuse(
        albums.map((album) => ({
          ...album,
          artist_name: artists.find((artist) => artist.id === album.artist)?.name || "",
        })),
        {
          keys: ["title", "artist_name"],
          includeScore: true,
          threshold: 0.4,
          ignoreLocation: true,
          minMatchCharLength: 1,
        }
      );
      const results = fuse.search(albumSearch).map((result) => result.item);
      setFilteredAlbums(results);
    }
  }, [albumSearch, albums, artists]);

  // Filter songs based on search query
  const fuseSongs = new Fuse(songs, {
    keys: ["title"],
    includeScore: true,
    threshold: 0.6,
    ignoreLocation: true,
    minMatchCharLength: 1,
  });

  const filteredSongs = songSearch
    ? fuseSongs.search(songSearch).map((result) => result.item)
    : songs;

  // Separate songs into in-album and available
  const songsInAlbum = addingSongsToAlbum
    ? filteredSongs.filter((song) => selectedSongIds.includes(song.id))
    : [];

  const availableSongs = addingSongsToAlbum
    ? filteredSongs.filter(
        (song) => !song.album && !selectedSongIds.includes(song.id)
      )
    : [];

  // Pagination logic
  const totalAlbums = filteredAlbums.length;
  const totalPages = Math.ceil(totalAlbums / albumsPerPage);
  const indexOfLastAlbum = currentPage * albumsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
  const currentAlbums = filteredAlbums.slice(indexOfFirstAlbum, indexOfLastAlbum);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-500 flex items-center">
          <FaCompactDisc className="mr-3" /> Quản Lý Album
        </h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full flex items-center transition"
        >
          <FaPlus className="mr-2" /> {isAdding ? "Đóng Form" : "Thêm Album"}
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          value={albumSearch}
          onChange={(e) => setAlbumSearch(e.target.value)}
          placeholder="Tìm kiếm album theo tên, nghệ sĩ."
          className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-100"
        />
      </div>

      {/* Add Album Form */}
      {isAdding && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-400">
            Thêm Album Mới
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên Album
              </label>
              <input
                type="text"
                value={newAlbum.title}
                onChange={(e) =>
                  setNewAlbum({ ...newAlbum, title: e.target.value })
                }
                placeholder="Nhập tên album"
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nghệ sĩ</label>
              <select
                value={newAlbum.artist}
                onChange={(e) =>
                  setNewAlbum({ ...newAlbum, artist: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Chọn nghệ sĩ</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Ngày phát hành
              </label>
              <input
                type="date"
                value={newAlbum.release_date}
                onChange={(e) =>
                  setNewAlbum({ ...newAlbum, release_date: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ảnh bìa</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-100 hover:file:bg-gray-600"
              />
            </div>
          </div>
          <button
            onClick={addAlbum}
            disabled={!newAlbum.title || !newAlbum.artist}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full flex items-center mx-auto transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thêm Album
          </button>
        </div>
      )}

      {/* Edit Album Form */}
      {editingAlbum && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-400">
            Chỉnh Sửa Album
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên Album
              </label>
              <input
                type="text"
                value={editingAlbum.title}
                onChange={(e) =>
                  setEditingAlbum({ ...editingAlbum, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nghệ sĩ</label>
              <select
                value={editingAlbum.artist}
                onChange={(e) =>
                  setEditingAlbum({ ...editingAlbum, artist: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Chọn nghệ sĩ</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Ngày phát hành
              </label>
              <input
                type="date"
                value={editingAlbum.release_date}
                onChange={(e) =>
                  setEditingAlbum({
                    ...editingAlbum,
                    release_date: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ảnh bìa</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-100 hover:file:bg-gray-600"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={updateAlbum}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-full transition"
            >
              Lưu Thay Đổi
            </button>
            <button
              onClick={cancelEditing}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-full transition"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Add Songs to Album Form */}
      {addingSongsToAlbum && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-8">
          <h2 className="text-lg font-semibold mb-3 text-green-400">
            Quản Lý Bài Hát: {addingSongsToAlbum.title}
          </h2>
          <div className="mb-3">
            <input
              type="text"
              value={songSearch}
              onChange={(e) => setSongSearch(e.target.value)}
              placeholder="Tìm kiếm bài hát..."
              className="w-full px-3 py-1.5 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-3 text-sm text-gray-400">
            Đã chọn {selectedSongIds.length} bài hát
          </div>
          <div className="max-h-64 overflow-y-auto bg-gray-700 p-3 rounded">
            {filteredSongs.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                Không tìm thấy bài hát
              </div>
            ) : (
              <>
                {songsInAlbum.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-green-400 mb-2">
                      Bài Hát Trong Album
                    </h3>
                    {songsInAlbum.map((song) => (
                      <div key={song.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={selectedSongIds.includes(song.id)}
                          onChange={() => handleSongSelection(song.id)}
                          className="mr-2"
                        />
                        <span className="text-gray-300">{song.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                {availableSongs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-green-400 mb-2">
                      Bài Hát Có Sẵn
                    </h3>
                    {availableSongs.map((song) => (
                      <div key={song.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={selectedSongIds.includes(song.id)}
                          onChange={() => handleSongSelection(song.id)}
                          className="mr-2"
                        />
                        <span className="text-gray-300">{song.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex justify-center space-x-3 mt-4">
            <button
              onClick={addSongsToAlbum}
              disabled={isSubmittingSongs || !selectedSongIds.length}
              className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-5 rounded-full text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingSongs ? "Đang xử lý..." : "Cập nhật"}
            </button>
            <button
              onClick={cancelAddingSongs}
              disabled={isSubmittingSongs}
              className="bg-gray-600 hover:bg-gray-700 text-white py-1.5 px-5 rounded-full text-sm transition disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Albums List */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            Đang tải danh sách album...
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Không tìm thấy album nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left">Ảnh bìa</th>
                  <th className="px-6 py-4 text-left">Tên Album</th>
                  <th className="px-6 py-4 text-left">Nghệ sĩ</th>
                  <th className="px-6 py-4 text-left">Ngày phát hành</th>
                  <th className="px-6 py-4 text-left">Bài hát</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentAlbums.map((album) => (
                  <tr key={album.id} className="hover:bg-gray-750 transition">
                    <td className="px-6 py-4">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded object-cover"
                          src={album.image || "https://via.placeholder.com/50"}
                          alt={album.title}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{album.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-400">
                        {artists.find((artist) => artist.id === album.artist)
                          ?.name || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-400">
                        {new Date(album.release_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-400">
                        {album.songs?.length
                          ? album.songs.map((song) => song.title).join(", ")
                          : "No songs"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => startAddingSongs(album)}
                          className="text-green-400 hover:text-green-300 transition"
                          title="Thêm bài hát"
                        >
                          <FaMusic />
                        </button>
                        <button
                          onClick={() => startEditing(album)}
                          className="text-blue-400 hover:text-blue-300 transition"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteAlbum(album.id, album.title)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Xóa"
                        >
                          <FaTrash />
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
  );
}

export default AdminAlbum;