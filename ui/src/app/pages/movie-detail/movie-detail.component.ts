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
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.scss'
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
