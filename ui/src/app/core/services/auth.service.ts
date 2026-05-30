import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  public isAuthenticated = signal(false);

  constructor(private api: ApiService, private router: Router) {
    // Best-effort session restore (cookie-based).
    if (typeof window !== 'undefined') {
      this.refreshSession().subscribe();
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.api.login(email, password).pipe(
      tap(response => {
        this.userSubject.next(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  signup(name: string, email: string, password: string): Observable<any> {
    return this.api.signup(name, email, password).pipe(
      tap(response => {
        this.userSubject.next(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => {
        this.userSubject.next(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        // Even if the server call fails, clear local state.
        this.userSubject.next(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/']);
      }
    });
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  refreshSession(): Observable<boolean> {
    return this.api.me().pipe(
      tap(({ user }) => {
        this.userSubject.next(user);
        this.isAuthenticated.set(true);
      }),
      map(() => true),
      catchError(() => {
        this.userSubject.next(null);
        this.isAuthenticated.set(false);
        return of(false);
      })
    );
  }
}
