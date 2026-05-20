import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="container flex-between">
        <div class="navbar-brand">
          <h1 class="logo">CineZone</h1>
        </div>

        <div class="navbar-links">
          <a routerLink="/browse" class="nav-link">Browse</a>
          <a routerLink="/watchlist" class="nav-link">Watchlist</a>
        </div>

        <div class="navbar-user">
          <div *ngIf="(authService.user$ | async) as user" class="user-menu">
            <span class="user-name">{{ user.name }}</span>
            <button (click)="logout()" class="btn btn-text">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: rgba(20, 20, 32, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(42, 42, 50, 0.5);
      padding: 1rem 0;
      sticky: top;
      top: 0;
      z-index: 100;
    }

    .navbar-brand {
      .logo {
        font-size: 1.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .navbar-links {
      display: flex;
      gap: 2rem;

      .nav-link {
        color: #a1a1a6;
        font-weight: 500;
        transition: color 0.3s ease;

        &:hover {
          color: #7c3aed;
        }
      }
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1.5rem;

      .user-menu {
        display: flex;
        align-items: center;
        gap: 1rem;

        .user-name {
          color: #e5e5e7;
          font-weight: 500;
        }
      }
    }

    @media (max-width: 768px) {
      .navbar-links {
        gap: 1rem;
      }

      .navbar-user {
        gap: 0.5rem;
      }

      .logo {
        font-size: 1.25rem !important;
      }
    }

    @media (max-width: 640px) {
      .navbar-links {
        display: none;
      }

      .navbar-user {
        gap: 0.5rem;

        .user-name {
          display: none;
        }
      }
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
