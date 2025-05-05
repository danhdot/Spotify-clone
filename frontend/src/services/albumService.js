// src/services/albumService.js
export const fetchAlbums = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/albums/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching albums:', error);
      return [];
    }
  };