import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  readonly genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Animation'];

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  deleteForm!: FormGroup;

  preferredGenres = signal<string[]>([]);
  savingProfile = signal(false);
  savingPassword = signal(false);
  savingPreferences = signal(false);
  deletingAccount = signal(false);

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    public authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    this.profileForm = this.fb.group({
      name: [user?.name ?? '', [Validators.required, Validators.minLength(2)]],
      email: [user?.email ?? '', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    this.deleteForm = this.fb.group({
      password: ['', Validators.required]
    });

    this.preferredGenres.set(user?.preferredGenres ?? []);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    this.api.updateProfile(this.profileForm.value).subscribe({
      next: ({ user }) => {
        this.authService.setUser(user);
        this.savingProfile.set(false);
        this.toast.success('Profile updated');
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to update profile');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    const { newPassword, confirmPassword, currentPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toast.error('New passwords do not match');
      return;
    }
    this.savingPassword.set(true);
    this.api.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.toast.success('Password changed');
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to change password');
      }
    });
  }

  toggleGenre(genre: string): void {
    const current = this.preferredGenres();
    this.preferredGenres.set(
      current.includes(genre) ? current.filter(g => g !== genre) : [...current, genre]
    );
  }

  savePreferences(): void {
    this.savingPreferences.set(true);
    this.api.updatePreferences(this.preferredGenres()).subscribe({
      next: () => {
        this.savingPreferences.set(false);
        this.toast.success('Preferences saved');
      },
      error: () => {
        this.savingPreferences.set(false);
        this.toast.error('Failed to save preferences');
      }
    });
  }

  deleteAccount(): void {
    if (this.deleteForm.invalid) return;
    this.deletingAccount.set(true);
    this.api.deleteAccount(this.deleteForm.value.password).subscribe({
      next: () => {
        this.authService.clearSession();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.deletingAccount.set(false);
        this.toast.error(err?.error?.message ?? 'Failed to delete account');
      }
    });
  }
}
