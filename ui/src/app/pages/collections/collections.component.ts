import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Collection } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss'
})
export class CollectionsComponent implements OnInit {
  collections = signal<Collection[]>([]);
  loading = signal(true);

  createControl = new FormControl('', [Validators.required, Validators.maxLength(100)]);
  creating = signal(false);

  editingId = signal<number | null>(null);
  renameControl = new FormControl('', [Validators.required, Validators.maxLength(100)]);

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.getCollections().subscribe({
      next: (cols) => { this.collections.set(cols); this.loading.set(false); },
      error: () => { this.toast.error('Failed to load collections'); this.loading.set(false); }
    });
  }

  create(): void {
    if (this.createControl.invalid || this.creating()) return;
    this.creating.set(true);
    this.api.createCollection(this.createControl.value!).subscribe({
      next: (col) => {
        this.collections.update(list => [col, ...list]);
        this.createControl.reset();
        this.creating.set(false);
        this.toast.success('Collection created');
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to create collection');
        this.creating.set(false);
      }
    });
  }

  startRename(col: Collection): void {
    this.editingId.set(col.id);
    this.renameControl.setValue(col.name);
  }

  cancelRename(): void {
    this.editingId.set(null);
  }

  saveRename(id: number): void {
    if (this.renameControl.invalid) return;
    this.api.renameCollection(id, this.renameControl.value!).subscribe({
      next: (updated) => {
        this.collections.update(list => list.map(c => c.id === id ? { ...c, name: updated.name } : c));
        this.editingId.set(null);
        this.toast.success('Collection renamed');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Failed to rename collection')
    });
  }

  delete(id: number): void {
    this.api.deleteCollection(id).subscribe({
      next: () => {
        this.collections.update(list => list.filter(c => c.id !== id));
        this.toast.success('Collection deleted');
      },
      error: () => this.toast.error('Failed to delete collection')
    });
  }

  view(id: number): void {
    this.router.navigate(['/collections', id]);
  }
}
