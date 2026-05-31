import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, Movie, Review, StreamResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  signup(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signup`, { name, email, password });
  }

  me(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.baseUrl}/auth/me`);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
  }

  getMovies(search?: string, genre?: string): Observable<Movie[]> {
    let url = `${this.baseUrl}/movies`;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genre) params.append('genre', genre);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return this.http.get<Movie[]>(url);
  }

  getMovie(id: string): Observable<Movie> {
    return this.http.get<Movie>(`${this.baseUrl}/movies/${id}`);
  }

  getStream(id: string): Observable<StreamResponse> {
    return this.http.get<StreamResponse>(`${this.baseUrl}/movies/${id}/stream`);
  }

  addToWatchlist(movieId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/watchlist`, { movieId });
  }

  getWatchlist(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.baseUrl}/watchlist`);
  }

  removeFromWatchlist(movieId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/watchlist/${movieId}`);
  }

  updateProfile(data: { name: string; email: string }): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.baseUrl}/auth/profile`, data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/auth/password`, data);
  }

  updatePreferences(preferredGenres: string[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/auth/preferences`, { preferredGenres });
  }

  deleteAccount(password: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/auth/account`, { body: { password } });
  }

  getReviews(movieId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/reviews?movieId=${encodeURIComponent(movieId)}`);
  }

  createReview(movieId: string, data: { rating: number; comment: string }): Observable<Review> {
    return this.http.post<Review>(`${this.baseUrl}/reviews`, { movieId, ...data });
  }

  updateReview(id: number, data: { rating: number; comment: string }): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/reviews/${id}`, data);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/reviews/${id}`);
  }
}
