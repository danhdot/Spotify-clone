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
    return api.get(`/playlists/${id}`);
  },

  getFavorites(): Promise<AxiosResponse<Favorite>> {
    return api.get('/favorites');
  }
};