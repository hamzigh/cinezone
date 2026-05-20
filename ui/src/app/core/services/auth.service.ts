import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();
  public isAuthenticated = signal(!!this.getToken());

  constructor(private api: ApiService, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.api.login(email, password).pipe(
      tap(response => {
        this.setSession(response.token, response.user);
        this.userSubject.next(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  signup(name: string, email: string, password: string): Observable<any> {
    return this.api.signup(name, email, password).pipe(
      tap(response => {
        this.setSession(response.token, response.user);
        this.userSubject.next(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
