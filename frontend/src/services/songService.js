// src/services/songService.js
export const fetchSongs = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/songs/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching songs:', error);
      return [];
    }
  };