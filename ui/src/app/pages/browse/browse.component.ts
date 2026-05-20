import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Movie } from '../../core/models/models';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MovieCardComponent, LoadingSkeletonComponent],
  template: `
    <div class="browse-page">
      <div class="container">
        <div class="browse-header">
          <h1>Browse Movies</h1>
        </div>

        <div class="filters">
          <input
            type="text"
            placeholder="Search movies..."
            [formControl]="searchControl"
            class="search-input"
          />

          <div class="genre-tabs">
            <button
              *ngFor="let genre of genres"
              [class.active]="selectedGenre === genre"
              (click)="selectGenre(genre)"
              class="genre-tab"
            >
              {{ genre }}
            </button>
          </div>
        </div>

        <div *ngIf="loading; else movieGrid" class="loading">
          <app-loading-skeleton type="grid"></app-loading-skeleton>
        </div>

        <ng-template #movieGrid>
          <div class="movies-grid">
            <a
              *ngFor="let movie of movies$ | async"
              [routerLink]="['/movie', movie.id]"
              class="movie-link"
            >
              <app-movie-card [movie]="movie"></app-movie-card>
            </a>
          </div>

          <div *ngIf="(movies$ | async)?.length === 0" class="no-results">
            <p>No movies found. Try a different search or genre.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .browse-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a25 100%);
      padding: 2rem 0;
    }

    .browse-header {
      margin-bottom: 3rem;

      h1 {
        color: #e5e5e7;
      }
    }

    .filters {
      margin-bottom: 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .search-input {
        padding: 1rem;
        background-color: #141420;
        border: 1px solid #2a2a32;
        border-radius: 0.5rem;
        color: #e5e5e7;
        font-size: 1rem;
        width: 100%;
        max-width: 400px;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        &::placeholder {
          color: #727278;
        }
      }

      .genre-tabs {
        display: flex;
        gap: 0.75rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;

        .genre-tab {
          padding: 0.5rem 1rem;
          background-color: #141420;
          color: #a1a1a6;
          border: 1px solid #2a2a32;
          border-radius: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;

          &:hover {
            border-color: #7c3aed;
            color: #7c3aed;
          }

          &.active {
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            color: white;
            border-color: #7c3aed;
          }
        }
      }
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

    .no-results {
      text-align: center;
      padding: 3rem;
      color: #a1a1a6;
      font-size: 1.125rem;
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
      .filters {
        .genre-tabs {
          gap: 0.5rem;

          .genre-tab {
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }
        }
      }

      .movies-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BrowseComponent implements OnInit {
  movies$ = new BehaviorSubject<Movie[]>([]);
  searchControl = new FormControl('');
  selectedGenre = 'All';
  genres = ['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Animation'];
  loading = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadMovies();
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadMovies());
  }

  selectGenre(genre: string): void {
    this.selectedGenre = genre;
    this.loadMovies();
  }

  private loadMovies(): void {
    this.loading = true;
    const search = this.searchControl.value || undefined;
    const genre = this.selectedGenre === 'All' ? undefined : this.selectedGenre;

    this.api.getMovies(search, genre).subscribe({
      next: (movies) => {
        this.movies$.next(movies);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error('Failed to load movies');
      }
    });
  }
}
