import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Movie } from '../../core/models/models';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCardComponent, LoadingSkeletonComponent],
  template: `
    <div class="watchlist-page">
      <div class="container">
        <h1>My Watchlist</h1>

        <div *ngIf="loading; else watchlistContent" class="loading">
          <app-loading-skeleton type="grid"></app-loading-skeleton>
        </div>

        <ng-template #watchlistContent>
          <div class="movies-grid">
            <a
              *ngFor="let movie of movies"
              [routerLink]="['/movie', movie.id]"
              class="movie-link"
            >
              <app-movie-card
                [movie]="movie"
                [showRemove]="true"
                (remove)="removeFromWatchlist($event)"
                (click)="$event.preventDefault()"
              ></app-movie-card>
            </a>
          </div>

          <div *ngIf="movies.length === 0" class="empty-state">
            <div class="empty-icon">📽️</div>
            <h2>Your watchlist is empty</h2>
            <p>Add movies to your watchlist to watch them later</p>
            <a routerLink="/browse" class="btn btn-primary">Browse Movies</a>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .watchlist-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a25 100%);
      padding: 2rem 0;
    }

    h1 {
      color: #e5e5e7;
      margin-bottom: 2rem;
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;

      .movie-link {
        text-decoration: none;
        color: inherit;

        &:hover {
          app-movie-card {
            transform: scale(1.05);
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      h2 {
        color: #e5e5e7;
        margin-bottom: 0.5rem;
      }

      p {
        color: #a1a1a6;
        margin-bottom: 2rem;
      }
    }

    .loading {
      padding: 2rem 0;
    }

    @media (max-width: 1024px) {
      .movies-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .movies-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WatchlistComponent implements OnInit {
  movies: Movie[] = [];
  loading = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadWatchlist();
  }

  private loadWatchlist(): void {
    this.loading = true;
    this.api.getWatchlist().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load watchlist');
      }
    });
  }

  removeFromWatchlist(movieId: string): void {
    this.api.removeFromWatchlist(movieId).subscribe({
      next: () => {
        this.movies = this.movies.filter(m => m.id !== movieId);
        this.toast.success('Removed from watchlist');
      },
      error: () => {
        this.toast.error('Failed to remove from watchlist');
      }
    });
  }
}
