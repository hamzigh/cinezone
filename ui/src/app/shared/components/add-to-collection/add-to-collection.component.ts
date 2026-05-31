import { Component, HostListener, Input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Collection, Movie } from '../../../core/models/models';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-add-to-collection',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-to-collection.component.html',
  styleUrl: './add-to-collection.component.scss'
})
export class AddToCollectionComponent implements OnInit {
  @Input({ required: true }) movie!: Movie;

  isOpen = signal(false);
  collections = signal<Collection[]>([]);
  containingIds = signal<Set<number>>(new Set());
  creating = signal(false);
  newNameControl = new FormControl('', [Validators.required, Validators.maxLength(100)]);

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.api.getCollections().subscribe({ next: (cols) => this.collections.set(cols) });
      this.api.getCollectionsContaining(this.movie.id).subscribe({
        next: (ids) => this.containingIds.set(new Set(ids))
      });
    }
  }

  toggleOpen(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.isOpen.set(false);
  }

  contains(id: number): boolean {
    return this.containingIds().has(id);
  }

  toggleCollection(event: MouseEvent, col: Collection): void {
    event.stopPropagation();
    if (this.contains(col.id)) {
      this.api.removeFromCollection(col.id, this.movie.id).subscribe({
        next: () => {
          this.containingIds.update(s => { const n = new Set(s); n.delete(col.id); return n; });
          this.collections.update(list => list.map(c => c.id === col.id ? { ...c, itemCount: c.itemCount - 1 } : c));
        },
        error: () => this.toast.error('Failed to remove from collection')
      });
    } else {
      this.api.addToCollection(col.id, {
        movieId: this.movie.id,
        movieTitle: this.movie.title,
        moviePosterUrl: this.movie.posterUrl
      }).subscribe({
        next: () => {
          this.containingIds.update(s => new Set([...s, col.id]));
          this.collections.update(list => list.map(c => c.id === col.id ? { ...c, itemCount: c.itemCount + 1 } : c));
          this.toast.success(`Added to "${col.name}"`);
        },
        error: () => this.toast.error('Failed to add to collection')
      });
    }
  }

  createAndAdd(event: Event): void {
    event.stopPropagation();
    if (this.newNameControl.invalid || this.creating()) return;
    this.creating.set(true);

    this.api.createCollection(this.newNameControl.value!).subscribe({
      next: (col) => {
        this.api.addToCollection(col.id, {
          movieId: this.movie.id,
          movieTitle: this.movie.title,
          moviePosterUrl: this.movie.posterUrl
        }).subscribe({
          next: () => {
            this.collections.update(list => [{ ...col, itemCount: 1 }, ...list]);
            this.containingIds.update(s => new Set([...s, col.id]));
            this.newNameControl.reset();
            this.creating.set(false);
            this.toast.success(`Created "${col.name}" and added movie`);
          },
          error: () => {
            this.collections.update(list => [col, ...list]);
            this.newNameControl.reset();
            this.creating.set(false);
          }
        });
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to create collection');
        this.creating.set(false);
      }
    });
  }
}
