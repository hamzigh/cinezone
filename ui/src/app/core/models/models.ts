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

export interface Review {
  id: number;
  movieId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: number;
  userId: string;
  name: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  collectionId: number;
  movieId: string;
  movieTitle: string;
  moviePosterUrl: string;
  addedAt: string;
}

export interface CollectionDetail extends Collection {
  items: CollectionItem[];
}

export interface AuthResponse {
  user: User;
}

export interface StreamResponse {
  url: string;
}
