import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Movie } from '../../core/models/models';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MovieCardComponent, LoadingSkeletonComponent],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent implements OnInit {
  movies = signal<Movie[]>([]);
  searchControl = new FormControl('');
  selectedGenre = 'All';
  genres = ['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Animation'];
  loading = signal(false);

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
    this.loading.set(true);
    const search = this.searchControl.value || undefined;
    const genre = this.selectedGenre === 'All' ? undefined : this.selectedGenre;

    this.api.getMovies(search, genre).subscribe({
      next: (movies) => {
        this.movies.set(movies);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error('Failed to load movies');
        this.loading.set(false);
      }
    });
  }
}
