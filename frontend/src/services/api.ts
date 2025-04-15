import axios, { AxiosResponse } from 'axios';

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const mediaApi = {
  async search(query: string): Promise<ApiResponse<SearchResult[]>> {
    const [songsRes, videosRes] = await Promise.all([
      api.get<Media[]>(`/songs/search?q=${query}`),
      api.get<Media[]>(`/videos/search?q=${query}`)
    ]);

    const songs = songsRes.data.map((song: Media) => ({ ...song, type: 'song' as const }));
    const videos = videosRes.data.map((video: Media) => ({ ...video, type: 'video' as const }));

    return {
      data: [...songs, ...videos],
      status: 200,
      statusText: 'OK'
    };
  },

  getPlaylist(id: number): Promise<AxiosResponse<Playlist>> {
    return api.get(`/playlists/${id}/`); // Add trailing slash for consistency
  },

  getUserPlaylists(): Promise<AxiosResponse<Playlist[]>> {
    // Assumes the backend endpoint /api/playlists/ returns playlists for the authenticated user
    return api.get('/playlists/');
  },

  createPlaylist(name: string): Promise<AxiosResponse<Playlist>> {
    // POST request to the endpoint that creates a playlist
    return api.post('/playlists/', { name });
  },

  // Fetches the user's Favorite object (assuming the list endpoint returns one item for the user)
  async getUserFavoriteObject(): Promise<AxiosResponse<Favorite>> {
    // The backend ViewSet's get_queryset filters by user, so this should return a list
    // containing zero or one Favorite object for the logged-in user.
    const response = await api.get<Favorite[]>('/favorites/');
    // We need the single object, not the list, for the ID.
    // If the list is empty (user has no Favorite object yet), handle appropriately.
    // For now, assume it exists or backend creates one on first like.
    // This might need more robust error handling or logic if backend doesn't auto-create.
    if (response.data && response.data.length > 0) {
       // Return a response structure similar to AxiosResponse but with the single object
       return { ...response, data: response.data[0] };
    } else {
       // Handle case where no favorite object exists - maybe throw error or return null/empty
       // Throwing error for now, calling code should handle this.
       throw new Error("User's Favorite object not found.");
       // Alternatively, could try to create one here, but backend might handle it.
    }
  },

  // Toggles a song in the user's favorites
  toggleFavoriteSong(favoriteId: number, songId: number): Promise<AxiosResponse<{ status: string }>> {
    return api.post(`/favorites/${favoriteId}/toggle_song/`, { song_id: songId });
  },

  // Toggles a video in the user's favorites
  toggleFavoriteVideo(favoriteId: number, videoId: number): Promise<AxiosResponse<{ status: string }>> {
    return api.post(`/favorites/${favoriteId}/toggle_video/`, { video_id: videoId });
  },

  getSong(id: number): Promise<AxiosResponse<Song>> {
    return api.get(`/songs/${id}/`);
  }

  // Note: Removed the old getFavorites() as getUserFavoriteObject() is more specific
};
