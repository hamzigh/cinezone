import { Component, OnInit, signal } from '@angular/core';
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
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.scss'
})
export class WatchlistComponent implements OnInit {
  movies = signal<Movie[]>([]);
  loading = signal(false);

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadWatchlist();
  }

  private loadWatchlist(): void {
    this.loading.set(true);
    this.api.getWatchlist().subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load watchlist');
      }
    });
  }

  removeFromWatchlist(movieId: string): void {
    this.api.removeFromWatchlist(movieId).subscribe({
      next: () => {
        this.movies.set(this.movies().filter(m => m.id !== movieId));
        this.toast.success('Removed from watchlist');
      },
      error: () => {
        this.toast.error('Failed to remove from watchlist');
      }
    });
  }
}
