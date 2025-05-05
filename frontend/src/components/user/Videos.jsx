import { useState, useEffect, useContext } from "react";
import {
  FaPlay,
  FaPause,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { url } from "../../App";
import { PlayerContext } from "../../context/PlayerContext";

const Videos = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 4; // Số bài hát mỗi trang
  const { pauseTrack } = useContext(PlayerContext) || {};

  useEffect(() => {
    // Tạm dừng phát nhạc khi trang Videos được tải
    if (pauseTrack) {
      pauseTrack();
    }

    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${url}/api/songs/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Không thể lấy danh sách bài hát: ${response.status}`
          );
        }

        const data = await response.json();
        // Lọc các bài hát có video_file
        const videoSongs = data.filter((song) => song.video_file);
        setSongs(videoSongs);
        setFilteredSongs(videoSongs); // Khởi tạo danh sách lọc bằng danh sách gốc
        if (videoSongs.length > 0) {
          setSelectedSong(videoSongs[0]); // Chọn bài hát đầu tiên làm mặc định
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách bài hát:", err.message);
      }
    };

    fetchSongs();
  }, [pauseTrack]);

  // Lọc bài hát dựa trên từ khóa tìm kiếm
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSongs(songs); // Nếu không có từ khóa, hiển thị toàn bộ danh sách
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.artists.some((artist) =>
            artist.name.toLowerCase().includes(query)
          )
      );
      setFilteredSongs(filtered);
    }
    setCurrentPage(1); // Đặt lại về trang 1 khi tìm kiếm
  }, [searchQuery, songs]);

  // Tính toán bài hát hiển thị trên trang hiện tại
  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = filteredSongs.slice(indexOfFirstSong, indexOfLastSong);
  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);

  // Chuyển đến trang trước
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Chuyển đến trang tiếp theo
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    setIsPlaying(false); // Đặt lại trạng thái phát
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <h2 className="text-3xl font-bold mb-6">Video Âm Nhạc</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Trình phát video và điều khiển */}
        <div className="md:w-2/3">
          {selectedSong ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                {selectedSong.video_file ? (
                  <video
                    controls={true}
                    autoPlay={isPlaying}
                    className="w-full h-96 rounded-lg"
                    src={selectedSong.video_file}
                  ></video>
                ) : (
                  <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
                    <p>Không có video</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedSong.title}
                  </h3>
                  <p className="text-gray-400">
                    {selectedSong.artists
                      .map((artist) => artist.name)
                      .join(", ")}
                  </p>
                  {selectedSong.album && (
                    <p className="text-gray-400">{selectedSong.album.title}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>Không có video nào khả dụng.</p>
          )}
        </div>

        {/* Danh sách bài hát */}
        <div className="md:w-1/3">
          <h3 className="text-xl font-semibold mb-4">Thư Viện Video</h3>
          {/* Thanh tìm kiếm */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm bài hát hoặc nghệ sĩ..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {/* Danh sách bài hát */}
          <ul className="space-y-2">
            {currentSongs.length > 0 ? (
              currentSongs.map((song) => (
                <li
                  key={song.id}
                  onClick={() => handleSongSelect(song)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedSong?.id === song.id
                      ? "bg-gray-700"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <h4 className="font-medium">{song.title}</h4>
                  <p className="text-sm text-gray-400">
                    {song.artists.map((artist) => artist.name).join(", ")}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-gray-400">Không tìm thấy bài hát nào.</p>
            )}
          </ul>
          {/* Nút phân trang */}
          {filteredSongs.length > songsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`flex items-center px-3 py-2 rounded-lg text-white ${
                  currentPage === 1
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <FaChevronLeft className="mr-2" />
                Trước
              </button>
              <span className="text-gray-400">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center px-3 py-2 rounded-lg text-white ${
                  currentPage === totalPages
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                Sau
                <FaChevronRight className="ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videos;
