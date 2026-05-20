import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="(toasts$ | async) as toasts">
      <div *ngFor="let toast of toasts"
           [ngClass]="'toast toast-' + toast.type"
           class="toast-item">
        <span>{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .toast-item {
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      backdrop-filter: blur(10px);
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .toast-success {
      background-color: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
    }

    .toast-error {
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .toast-info {
      background-color: rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.3);
      color: #7c3aed;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 640px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
        top: 1rem;
      }

      .toast-item {
        min-width: auto;
      }
    }
  `]
})
export class ToastComponent {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }
}
