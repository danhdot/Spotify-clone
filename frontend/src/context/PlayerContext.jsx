import { createContext, useState, useRef, useEffect } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [track, setTrack] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [repeat, setRepeat] = useState(false);

  const audioRef = useRef(new Audio());

  const parseDuration = (durationStr) => {
    if (!durationStr || !/\d{2}:\d{2}:\d{2}/.test(durationStr)) return 0;
    const [hours, minutes, seconds] = durationStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const loadPlaylist = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/songs/");
      if (!response.ok) throw new Error("Không thể tải danh sách phát");
      const songs = await response.json();
      const normalizedSongs = songs.map((song) => ({
        id: song.id,
        title: song.title,
        artist: Array.isArray(song.artists)
          ? song.artists.map((a) => a.name).join(", ")
          : "Không rõ nghệ sĩ",
        cover:
          song.image || song.album?.image || "https://via.placeholder.com/300",
        file: song.audio_file,
        duration: song.duration,
      }));
      setPlaylist(normalizedSongs);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phát:", error.message);
    }
  };

  const loadTrack = async (songId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/songs/${songId}/`
      );
      if (!response.ok) throw new Error("Không thể tải bài hát");
      const song = await response.json();
      playTrack({
        id: song.id,
        title: song.title,
        artist: Array.isArray(song.artists)
          ? song.artists.map((a) => a.name).join(", ")
          : "Không rõ nghệ sĩ",
        cover:
          song.image || song.album?.image || "https://via.placeholder.com/300",
        file: song.audio_file,
        duration: song.duration,
      });
    } catch (error) {
      handleError("Lỗi khi tải bài hát:", error);
    }
  };

  const handleError = (message, error) => {
    console.error(message, error.message);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const playTrack = (newTrack) => {
    if (!newTrack?.file) {
      handleError("Không có tệp âm thanh:", newTrack);
      return;
    }

    console.log("Đang phát bài hát:", newTrack.title);
    setTrack(newTrack);
    setCurrentTime(0);
    setDuration(parseDuration(newTrack.duration));

    // Thêm vào danh sách phát nếu chưa có
    if (!playlist.some((song) => song.id === newTrack.id)) {
      console.log("Thêm bài hát vào danh sách phát:", newTrack.title);
      setPlaylist((prev) => [...prev, newTrack]);
    }

    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = newTrack.file;
      audioRef.current.load();
      audioRef.current.volume = volume;
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (track) {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleShuffle = () => {
    setShuffle((prev) => {
      if (!prev) {
        setRepeat(false); // Tắt lặp lại khi bật xáo trộn
      }
      return !prev;
    });
  };

  const toggleRepeat = () => {
    setRepeat((prev) => {
      if (!prev) {
        setShuffle(false); // Tắt xáo trộn khi bật lặp lại
      }
      return !prev;
    });
  };

  const skipForward = () => {
    if (audioRef.current && duration) {
      const newTime = Math.min(audioRef.current.currentTime + 10, duration);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(audioRef.current.currentTime - 10, 0);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (
      !isNaN(newTime) &&
      newTime >= 0 &&
      newTime <= duration &&
      audioRef.current
    ) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const updateTime = () => {
      const newTime = audio.currentTime;
      setCurrentTime(newTime);

      // Kiểm tra nếu bài hát sắp kết thúc (trong vòng 1 giây)
      if (track && duration > 0 && duration - newTime < 1) {
        console.log("Bài hát sắp kết thúc:", track.title);
        if (repeat) {
          console.log("Chuẩn bị lặp lại:", track.title);
          playTrack(track);
        } else if (playlist.length) {
          if (shuffle) {
            let availableTracks = playlist;
            if (playlist.length > 1) {
              availableTracks = playlist.filter((song) => song.id !== track.id);
            }
            const randomIndex = Math.floor(
              Math.random() * availableTracks.length
            );
            console.log(
              "Chuẩn bị phát bài ngẫu nhiên:",
              availableTracks[randomIndex].title
            );
            playTrack(availableTracks[randomIndex]);
          } else {
            const currentIndex = playlist.findIndex(
              (song) => song.id === track.id
            );
            const nextIndex =
              currentIndex >= 0 && currentIndex < playlist.length - 1
                ? currentIndex + 1
                : 0;
            console.log(
              "Chuẩn bị phát bài tiếp theo:",
              playlist[nextIndex].title
            );
            playTrack(playlist[nextIndex]);
          }
        } else {
          console.log(
            "Không có danh sách phát, dừng sau bài hát:",
            track.title
          );
          setIsPlaying(false);
          setTrack(null);
          setCurrentTime(0);
          setDuration(0);
        }
      }
    };

    const errorHandler = (e) => handleError("Lỗi âm thanh:", e);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("error", errorHandler);

    if (track) {
      if (isPlaying) {
        audio.play().catch((e) => handleError("Lỗi khi phát âm thanh:", e));
      } else {
        audio.pause();
      }
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("error", errorHandler);
      audio.pause();
    };
  }, [isPlaying, track, repeat, shuffle, playlist, duration]);

  useEffect(() => {
    loadPlaylist();
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        togglePlay,
        track,
        playTrack,
        pauseTrack, // Thêm hàm pauseTrack vào context
        loadTrack,
        skipForward,
        skipBackward,
        currentTime,
        duration,
        handleSeek,
        volume,
        handleVolumeChange,
        shuffle,
        toggleShuffle,
        playlist,
        repeat,
        toggleRepeat,
        audioRef, // Giữ audioRef để tương thích với các component khác
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerProvider;
