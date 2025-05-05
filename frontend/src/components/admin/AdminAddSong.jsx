import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { url } from "../../App";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMusic,
  FaImage,
  FaSpinner,
  FaSave,
  FaTimes,
  FaVideo,
} from "react-icons/fa";

const AdminAddSong = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    album: "",
    duration: "",
    artist: "",
    image: null,
    audio_file: null,
    video_file: null,
  });
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [albumData, setAlbumData] = useState([]);
  const [artists, setArtists] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingImage, setExistingImage] = useState("");
  const [existingAudio, setExistingAudio] = useState("");
  const [existingVideo, setExistingVideo] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      setDataLoading(true);
      try {
        const [albumsRes, artistsRes] = await Promise.all([
          axios.get(`${url}/api/albums/`),
          axios.get(`${url}/api/artists/`),
        ]);

        setAlbumData(albumsRes.data || []);
        setArtists(artistsRes.data || []);

        if (id) {
          setIsEditMode(true);
          const songRes = await axios.get(`${url}/api/songs/${id}/`);
          const song = songRes.data;

          setFormData({
            title: song.title || "",
            album: song.album ? song.album.id.toString() : "",
            duration: song.duration || "",
            artist: "",
            image: null,
            audio_file: null,
            video_file: null,
          });

          if (song.artists && Array.isArray(song.artists)) {
            const artistObjects = song.artists.map(
              (a) => artistsRes.data.find((artist) => artist.id === a.id) || a
            );
            setSelectedArtists(artistObjects);
          }

          setExistingImage(song.image ? `${song.image}` : "");
          setExistingAudio(song.audio_file ? `${song.audio_file}` : "");
          setExistingVideo(song.video_file ? `${song.video_file}` : "");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load initial data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const validateDurationFormat = (value) => {
    if (!value) return true; // Allow empty duration
    const regex = /^\d{2}:\d{2}:\d{2}$/;
    if (!regex.test(value)) return false;
    const [hours, minutes, seconds] = value.split(":").map(Number);
    return hours < 24 && minutes < 60 && seconds < 60;
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = "Song title is required";
    if (selectedArtists.length === 0)
      errors.artist = "At least one artist is required";
    if (!isEditMode && !formData.audio_file && !existingAudio) {
      errors.audio_file = "Audio file is required for new songs";
    }
    if (formData.duration && !validateDurationFormat(formData.duration)) {
      errors.duration = "Duration must be in HH:MM:SS format (e.g., 00:04:30)";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      if (formData.duration) {
        data.append("duration", formData.duration);
      }

      const artistIds = selectedArtists.map((artist) => artist.id);
      artistIds.forEach((id) => data.append("artist_ids", id));

      if (formData.album) {
        data.append("album_id", formData.album);
      } else if (isEditMode) {
        data.append("album_id", "");
      }

      if (formData.image) data.append("image", formData.image);
      if (formData.audio_file) data.append("audio_file", formData.audio_file);
      if (formData.video_file) data.append("video_file", formData.video_file);

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const response = isEditMode
        ? await axios.put(`${url}/api/songs/${id}/`, data, config)
        : await axios.post(`${url}/api/songs/`, data, config);

      if (response.status === 200 || response.status === 201) {
        toast.success(`Song ${isEditMode ? "updated" : "added"} successfully`);
        navigate("/admin/songs");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.detail || error.message;
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      const artist = artists.find((a) => a.id === parseInt(selectedId));
      if (artist && !selectedArtists.some((a) => a.id === artist.id)) {
        setSelectedArtists((prev) => [...prev, artist]);
      }
      e.target.value = "";
    }
  };

  const removeArtist = (artistId) => {
    setSelectedArtists((prev) => prev.filter((a) => a.id !== artistId));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleCancel = () => navigate("/admin/songs");

  const availableArtists = artists.filter(
    (artist) => !selectedArtists.some((selected) => selected.id === artist.id)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-green-500 mb-8">
          {isEditMode ? "Edit Song" : "Add New Song"}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <FaSpinner className="w-16 h-16 text-green-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  {isEditMode
                    ? "Update Song (Optional)"
                    : "Upload Song (MP3, WAV) *"}
                  {validationErrors.audio_file && (
                    <span className="text-red-500 text-xs ml-2">
                      {validationErrors.audio_file}
                    </span>
                  )}
                </label>
                <input
                  onChange={handleFileChange}
                  type="file"
                  name="audio_file"
                  id="audio_file"
                  accept="audio/*"
                  className="hidden"
                  required={!isEditMode && !existingAudio}
                />
                <label
                  htmlFor="audio_file"
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500 transition-colors ${
                    formData.audio_file || existingAudio
                      ? "border-green-500 bg-gray-800"
                      : "border-gray-700"
                  }`}
                >
                  <FaMusic
                    className={`w-12 h-12 mb-3 ${
                      formData.audio_file || existingAudio
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm text-center">
                    {formData.audio_file && formData.audio_file.name
                      ? formData.audio_file.name
                      : existingAudio
                      ? "Current file: " + existingAudio.split("/").pop()
                      : "Click to select audio file"}
                  </span>
                </label>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  {isEditMode
                    ? "Update Cover Image (Optional)"
                    : "Upload Cover Image (Optional)"}
                </label>
                <input
                  onChange={handleFileChange}
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500 transition-colors ${
                    formData.image || existingImage
                      ? "border-green-500 bg-gray-800"
                      : "border-gray-700"
                  }`}
                >
                  {formData.image ? (
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded mb-2"
                      onError={(e) =>
                        console.error("Error loading preview image:", e)
                      }
                    />
                  ) : existingImage ? (
                    <img
                      src={existingImage}
                      alt="Current cover"
                      className="w-24 h-24 object-cover rounded mb-2"
                      onError={(e) =>
                        console.error("Error loading existing image:", e)
                      }
                    />
                  ) : (
                    <FaImage className="w-12 h-12 mb-3 text-gray-500" />
                  )}
                  <span className="text-sm">
                    {formData.image && formData.image.name
                      ? formData.image.name
                      : existingImage
                      ? "Current cover image"
                      : "Click to select cover image"}
                  </span>
                </label>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  {isEditMode
                    ? "Update Video (Optional)"
                    : "Upload Video (Optional)"}
                </label>
                <input
                  onChange={handleFileChange}
                  type="file"
                  name="video_file"
                  id="video_file"
                  accept="video/*"
                  className="hidden"
                />
                <label
                  htmlFor="video_file"
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500 transition-colors ${
                    formData.video_file || existingVideo
                      ? "border-green-500 bg-gray-800"
                      : "border-gray-700"
                  }`}
                >
                  <FaVideo
                    className={`w-12 h-12 mb-3 ${
                      formData.video_file || existingVideo
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm text-center">
                    {formData.video_file && formData.video_file.name
                      ? formData.video_file.name
                      : existingVideo
                      ? "Current file: " + existingVideo.split("/").pop()
                      : "Click to select video file"}
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-2"
                >
                  Song Title *
                  {validationErrors.title && (
                    <span className="text-red-500 text-xs ml-2">
                      {validationErrors.title}
                    </span>
                  )}
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter song title"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="selectedArtists"
                  className="block text-sm font-medium mb-2"
                >
                  Selected Artists *
                  {validationErrors.artist && (
                    <span className="text-red-500 text-xs ml-2">
                      {validationErrors.artist}
                    </span>
                  )}
                </label>
                <div className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded flex flex-wrap gap-2">
                  {selectedArtists.length > 0 ? (
                    selectedArtists.map((artist) => (
                      <div
                        key={artist.id}
                        className="flex items-center bg-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {artist.name || "Unnamed Artist"}
                        <button
                          type="button"
                          onClick={() => removeArtist(artist.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">No artists selected</span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="artist"
                  className="block text-sm font-medium mb-2"
                >
                  Add Artist
                </label>
                {dataLoading ? (
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-green-500" />
                    <span>Loading artists...</span>
                  </div>
                ) : (
                  <select
                    id="artist"
                    name="artist"
                    value=""
                    onChange={handleArtistChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Select Artist --</option>
                    {availableArtists.length > 0 ? (
                      availableArtists.map((artistItem) => (
                        <option key={artistItem.id} value={artistItem.id}>
                          {artistItem.name || "Unnamed Artist"}
                        </option>
                      ))
                    ) : (
                      <option disabled>No artists available</option>
                    )}
                  </select>
                )}
              </div>

              <div>
                <label
                  htmlFor="album"
                  className="block text-sm font-medium mb-2"
                  hidden
                >
                  Album (Optional)
                </label>
                {dataLoading ? (
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-green-500" />
                    <span>Loading albums...</span>
                  </div>
                ) : (
                  <select
                    id="album"
                    name="album"
                    value={formData.album}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    hidden
                  >
                    <option value="">-- Select Album --</option>
                    {albumData.length > 0 ? (
                      albumData.map((albumItem) => (
                        <option key={albumItem.id} value={albumItem.id}>
                          {albumItem.title || "Unnamed Album"}
                        </option>
                      ))
                    ) : (
                      <option disabled>No albums available</option>
                    )}
                  </select>
                )}
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium mb-2"
                >
                  Duration (HH:MM:SS)
                  {validationErrors.duration && (
                    <span className="text-red-500 text-xs ml-2">
                      {validationErrors.duration}
                    </span>
                  )}
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="text"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter duration in HH:MM:SS (optional)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-full transition-colors"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={dataLoading || loading}
                className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaSave className="mr-2" />
                )}
                {isEditMode ? "Update Song" : "Add Song"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminAddSong;
