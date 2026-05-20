import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Movie } from '../../core/models/models';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSkeletonComponent],
  template: `
    <div class="detail-page">
      <ng-container *ngIf="movie; else loading">
        <div
          class="backdrop"
          [style.backgroundImage]="'url(' + movie.backdropUrl + ')'"
        >
          <div class="backdrop-overlay"></div>
        </div>

        <div class="container detail-content">
          <button (click)="goBack()" class="back-btn">← Back</button>

          <div class="detail-grid">
            <div class="poster-section">
              <img [src]="movie.posterUrl" [alt]="movie.title" class="poster" />
            </div>

            <div class="info-section">
              <h1 class="title">{{ movie.title }}</h1>

              <div class="metadata">
                <span class="year">{{ movie.year }}</span>
                <span class="rating">
                  <span class="star">★</span>{{ movie.rating }}/10
                </span>
                <span class="genre">{{ movie.genre }}</span>
              </div>

              <p class="description">{{ movie.description }}</p>

              <div class="cast-section">
                <h3>Cast</h3>
                <div class="cast-list">
                  <span *ngFor="let actor of movie.cast" class="cast-member">
                    {{ actor }}
                  </span>
                </div>
              </div>

              <div class="actions">
                <button (click)="watchNow()" class="btn btn-primary">
                  ▶ Watch Now
                </button>
                <button
                  (click)="toggleWatchlist()"
                  [class.added]="isInWatchlist"
                  class="btn btn-secondary"
                >
                  {{ isInWatchlist ? '✓ In Watchlist' : '＋ Add to Watchlist' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="loading-container">
          <app-loading-skeleton type="title"></app-loading-skeleton>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .detail-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a25 100%);
    }

    .backdrop {
      position: relative;
      height: 400px;
      background-size: cover;
      background-position: center;
      margin-bottom: -100px;
    }

    .backdrop-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(10, 10, 15, 0), rgba(10, 10, 15, 0.8));
    }

    .detail-content {
      position: relative;
      z-index: 1;

      .back-btn {
        background: transparent;
        color: #7c3aed;
        border: none;
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 2rem;
        cursor: pointer;
        transition: color 0.3s ease;

        &:hover {
          color: #6d28d9;
        }
      }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 3rem;
      padding-bottom: 3rem;
    }

    .poster-section {
      .poster {
        width: 100%;
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      }
    }

    .info-section {
      color: #e5e5e7;

      .title {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }

      .metadata {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
        color: #a1a1a6;

        .year {
          font-weight: 600;
        }

        .rating {
          color: #fbbf24;
          font-weight: 600;

          .star {
            margin-right: 0.25rem;
          }
        }

        .genre {
          background-color: rgba(124, 58, 237, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
        }
      }

      .description {
        font-size: 1.05rem;
        line-height: 1.8;
        margin-bottom: 2rem;
        color: #a1a1a6;
        max-width: 600px;
      }

      .cast-section {
        margin-bottom: 2.5rem;

        h3 {
          margin-bottom: 1rem;
          color: #e5e5e7;
        }

        .cast-list {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;

          .cast-member {
            background-color: #141420;
            border: 1px solid #2a2a32;
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            color: #a1a1a6;
          }
        }
      }

      .actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;

        .btn {
          flex: 1;
          min-width: 150px;
        }

        .btn-secondary.added {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: #10b981;
          color: white;
        }
      }
    }

    .loading-container {
      padding: 3rem;
    }

    @media (max-width: 768px) {
      .backdrop {
        height: 250px;
        margin-bottom: -50px;
      }

      .detail-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .info-section {
        .title {
          font-size: 1.75rem;
        }

        .metadata {
          flex-wrap: wrap;
        }

        .actions {
          flex-direction: column;

          .btn {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  isInWatchlist = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovie(id);
    }
  }

  private loadMovie(id: string): void {
    this.api.getMovie(id).subscribe({
      next: (movie) => {
        this.movie = movie;
      },
      error: () => {
        this.toast.error('Failed to load movie');
      }
    });
  }

  watchNow(): void {
    if (this.movie) {
      this.router.navigate(['/watch', this.movie.id]);
    }
  }

  toggleWatchlist(): void {
    if (!this.movie) return;

    if (this.isInWatchlist) {
      this.api.removeFromWatchlist(this.movie.id).subscribe({
        next: () => {
          this.isInWatchlist = false;
          this.toast.success('Removed from watchlist');
        },
        error: () => {
          this.toast.error('Failed to remove from watchlist');
        }
      });
    } else {
      this.api.addToWatchlist(this.movie.id).subscribe({
        next: () => {
          this.isInWatchlist = true;
          this.toast.success('Added to watchlist');
        },
        error: () => {
          this.toast.error('Failed to add to watchlist');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/browse']);
  }
}
