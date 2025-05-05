import { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaVolumeUp, FaRandom, FaRedo } from 'react-icons/fa';
// import { BsFillHeartFill } from 'react-icons/bs';

const Player = () => {
  const {
    isPlaying,
    togglePlay,
    track,
    skipForward,
    skipBackward,
    currentTime = 0,
    duration = 0,
    handleSeek,
    volume,
    handleVolumeChange,
    shuffle,
    toggleShuffle,
    playlist,
    repeat,
    toggleRepeat,
  } = useContext(PlayerContext);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-800 flex items-center px-4">
      <div className="w-1/4 flex items-center">
        {track ? (
          <div className="flex items-center">
            <img
              src={track.cover || 'default.jpg'}
              alt={track.title}
              className="w-14 h-14 object-cover mr-3"
            />
            <div>
              <p className="text-white text-sm font-medium">{track.title}</p>
              <p className="text-gray-400 text-xs">{track.artist || 'Unknown Artist'}</p>
            </div>
          </div>
        ) : (
          <div className="text-gray-400"></div>
        )}
      </div>

      <div className="w-2/4 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={toggleShuffle}
            className={`p-1 rounded ${shuffle ? 'text-white' : 'text-gray-400'} hover:text-white`}
            disabled={!playlist?.length}
            title={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
          >
            <FaRandom size={14} />
          </button>
          <button
            onClick={skipBackward}
            className="text-gray-400 hover:text-white"
            disabled={!track}
          >
            <FaStepBackward size={18} />
          </button>
          <button
            onClick={togglePlay}
            className="bg-white rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition"
            disabled={!track}
          >
            {isPlaying ? (
              <FaPause size={14} className="text-black" />
            ) : (
              <FaPlay size={14} className="text-black ml-0.5" />
            )}
          </button>
          <button
            onClick={skipForward}
            className="text-gray-400 hover:text-white"
            disabled={!track}
          >
            <FaStepForward size={18} />
          </button>
          <button
            onClick={toggleRepeat}
            className={`p-1 rounded ${repeat ? 'text-white' : 'text-gray-400'} hover:text-white`}
            disabled={!track}
            title={repeat ? 'Disable repeat' : 'Enable repeat'}
          >
            <FaRedo size={14} />
          </button>
        </div>

        <div className="w-full flex items-center gap-2">
          <span className="text-xs text-gray-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime || 0}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            disabled={!track || !duration}
          />
          <span className="text-xs text-gray-400 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="w-1/4 flex justify-end items-center gap-2">
        <FaVolumeUp className="text-gray-400" size={14} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Player;