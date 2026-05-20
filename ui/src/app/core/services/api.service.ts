import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, Movie, StreamResponse } from '../models/models';

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
}
