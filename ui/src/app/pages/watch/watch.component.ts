import { Component, OnInit } from '@angular/core';
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
  template: `
    <div class="watch-page">
      <div class="video-container">
        <button (click)="goBack()" class="back-btn">← Back</button>

        <ng-container *ngIf="loading; else playerReady">
          <div class="skeleton-player"></div>
        </ng-container>

        <ng-template #playerReady>
          <div class="video-player">
            <iframe
              *ngIf="streamUrl"
              [src]="streamUrl | safeUrl"
              frameborder="0"
              allowfullscreen
              allow="autoplay; fullscreen; picture-in-picture"
            ></iframe>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .watch-page {
      width: 100%;
      height: 100vh;
      background-color: #0a0a0f;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .video-container {
      width: 100%;
      max-width: 1400px;
      position: relative;

      .back-btn {
        position: absolute;
        top: 1rem;
        left: 1rem;
        z-index: 10;
        background: rgba(124, 58, 237, 0.9);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;

        &:hover {
          background: #6d28d9;
          transform: translateX(-2px);
        }
      }
    }

    .video-player {
      width: 100%;
      aspect-ratio: 16 / 9;
      background-color: #000;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);

      iframe {
        width: 100%;
        height: 100%;
      }
    }

    .skeleton-player {
      width: 100%;
      aspect-ratio: 16 / 9;
      background: linear-gradient(90deg, #141420 0%, #1f1f2e 50%, #141420 100%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
      border-radius: 0.75rem;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class WatchComponent implements OnInit {
  streamUrl: string | null = null;
  loading = false;

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
    this.loading = true;
    this.api.getStream(id).subscribe({
      next: (response) => {
        this.streamUrl = response.url;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load video stream');
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
