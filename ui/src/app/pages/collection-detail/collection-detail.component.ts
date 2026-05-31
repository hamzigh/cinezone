import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CollectionDetail } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './collection-detail.component.html',
  styleUrl: './collection-detail.component.scss'
})
export class CollectionDetailComponent implements OnInit {
  collection = signal<CollectionDetail | null>(null);
  isRenaming = signal(false);
  renameControl = new FormControl('', [Validators.required, Validators.maxLength(100)]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCollection(id).subscribe({
      next: (c) => this.collection.set(c),
      error: () => {
        this.toast.error('Collection not found');
        this.router.navigate(['/collections']);
      }
    });
  }

  startRename(): void {
    this.renameControl.setValue(this.collection()!.name);
    this.isRenaming.set(true);
  }

  cancelRename(): void {
    this.isRenaming.set(false);
  }

  saveRename(): void {
    if (this.renameControl.invalid) return;
    const id = this.collection()!.id;
    this.api.renameCollection(id, this.renameControl.value!).subscribe({
      next: (updated) => {
        this.collection.update(c => c ? { ...c, name: updated.name } : c);
        this.isRenaming.set(false);
        this.toast.success('Collection renamed');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed to rename')
    });
  }

  removeItem(movieId: string): void {
    const col = this.collection();
    if (!col) return;
    this.api.removeFromCollection(col.id, movieId).subscribe({
      next: () => {
        this.collection.update(c => c
          ? { ...c, items: c.items.filter(i => i.movieId !== movieId), itemCount: c.itemCount - 1 }
          : c
        );
        this.toast.success('Movie removed from collection');
      },
      error: () => this.toast.error('Failed to remove movie')
    });
  }

  navigateToMovie(movieId: string): void {
    this.router.navigate(['/movie', movieId]);
  }
}
