import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  templateUrl: './watch.component.html',
  styleUrl: './watch.component.scss'
})
export class WatchComponent implements OnInit {
  streamUrl = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private toast: ToastService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStream(id);
    }
  }

  private loadStream(id: string): void {
    this.loading.set(true);
    this.api.getStream(id).subscribe({
      next: (response) => {
        this.streamUrl.set(response.url);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load video stream');
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
