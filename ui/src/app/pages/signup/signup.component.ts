import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <h1>Create Account</h1>
          <p class="subtitle">Join CineZone today</p>

          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input
                id="name"
                type="text"
                formControlName="name"
                placeholder="John Doe"
              />
              <small *ngIf="f['name'].invalid && f['name'].touched" class="error">
                Name is required
              </small>
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="your@email.com"
              />
              <small *ngIf="f['email'].invalid && f['email'].touched" class="error">
                Please enter a valid email address
              </small>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="••••••••"
              />
              <small *ngIf="f['password'].invalid && f['password'].touched" class="error">
                Password must be at least 6 characters
              </small>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="!signupForm.valid || loading"
            >
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>

          <p class="auth-link">
            Already have an account?
            <a routerLink="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a25 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .auth-container {
      width: 100%;
      max-width: 400px;
    }

    .auth-card {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(109, 40, 217, 0.05));
      border: 1px solid rgba(124, 58, 237, 0.2);
      padding: 3rem 2rem;
      border-radius: 1rem;
      backdrop-filter: blur(10px);

      h1 {
        color: #e5e5e7;
        margin-bottom: 0.5rem;
        text-align: center;
      }

      .subtitle {
        text-align: center;
        color: #a1a1a6;
        margin-bottom: 2rem;
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
          font-weight: 600;
          color: #e5e5e7;
          font-size: 0.875rem;
        }

        input {
          padding: 0.75rem 1rem;
          background-color: #141420;
          border: 1px solid #2a2a32;
          border-radius: 0.5rem;
          color: #e5e5e7;
          font-size: 1rem;
          transition: all 0.3s ease;

          &:focus {
            outline: none;
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
          }

          &::placeholder {
            color: #727278;
          }
        }

        .error {
          color: #ef4444;
          font-size: 0.75rem;
        }
      }

      .btn-block {
        width: 100%;
      }
    }

    .auth-link {
      text-align: center;
      color: #a1a1a6;
      font-size: 0.875rem;
      margin-top: 1.5rem;

      a {
        color: #7c3aed;
        font-weight: 600;

        &:hover {
          color: #6d28d9;
        }
      }
    }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.signupForm.controls;
  }

  onSubmit(): void {
    if (!this.signupForm.valid) return;

    this.loading = true;
    const { name, email, password } = this.signupForm.value;

    this.authService.signup(name, email, password).subscribe({
      next: () => {
        this.toast.success('Account created successfully');
        this.router.navigate(['/browse']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Sign up failed');
      }
    });
  }
}
