export interface User {
  id: string;
  name: string;
  email: string;
  preferredGenres?: string[];
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string;
  rating: number;
  posterUrl: string;
  backdropUrl: string;
  description: string;
  cast: string[];
  type?: 'movie' | 'tv';
}

export interface AuthResponse {
  user: User;
}

export interface StreamResponse {
  url: string;
}
