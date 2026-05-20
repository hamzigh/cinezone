import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="'skeleton-' + type">
      <ng-container [ngSwitch]="type">
        <div *ngSwitchCase="'card'" class="skeleton skeleton-card"></div>
        <div *ngSwitchCase="'grid'" class="skeleton-grid">
          <div *ngFor="let i of [1,2,3,4]" class="skeleton skeleton-card"></div>
        </div>
        <div *ngSwitchCase="'text'" class="skeleton skeleton-text"></div>
        <div *ngSwitchCase="'title'" class="skeleton skeleton-title"></div>
      </ng-container>
    </div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #141420 0%, #1f1f2e 50%, #141420 100%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
      border-radius: 0.5rem;
    }

    .skeleton-card {
      width: 100%;
      aspect-ratio: 2 / 3;
      border-radius: 0.75rem;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1.5rem;
    }

    .skeleton-text {
      height: 1rem;
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .skeleton-title {
      height: 2rem;
      width: 60%;
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
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'grid' | 'text' | 'title' = 'card';
}
