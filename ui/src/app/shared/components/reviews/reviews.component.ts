import { Component, Input, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Review, User } from '../../../core/models/models';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent implements OnInit {
  @Input({ required: true }) movieId!: string;

  reviews = signal<Review[]>([]);
  currentUser = signal<User | null>(null);
  submitting = signal(false);
  hoverRating = signal(0);
  isEditing = signal(false);

  readonly stars = [1, 2, 3, 4, 5];

  reviewForm = new FormGroup({
    rating: new FormControl<number>(0, [Validators.required, Validators.min(1), Validators.max(5)]),
    comment: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(500)])
  });

  userReview = computed(() =>
    this.reviews().find(r => r.userId === this.currentUser()?.id) ?? null
  );

  ratingDisplay = computed(() => this.hoverRating() || (this.reviewForm.get('rating')!.value ?? 0));

  averageRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return 0;
    return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  });

  readonly starLabel = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  constructor(
    private api: ApiService,
    protected auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser.set(this.auth.getUser());
    this.loadReviews();
  }

  private loadReviews(): void {
    this.api.getReviews(this.movieId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
      },
      error: () => this.toast.error('Failed to load reviews')
    });
  }

  setRating(value: number): void {
    this.reviewForm.get('rating')!.setValue(value);
    this.hoverRating.set(0);
  }

  get commentControl() { return this.reviewForm.get('comment')!; }
  get ratingControl() { return this.reviewForm.get('rating')!; }

  startEdit(): void {
    const mine = this.userReview();
    if (!mine) return;
    this.reviewForm.setValue({ rating: mine.rating, comment: mine.comment });
    this.hoverRating.set(0);
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    const mine = this.userReview();
    if (mine) {
      this.reviewForm.setValue({ rating: mine.rating, comment: mine.comment });
    }
    this.hoverRating.set(0);
    this.isEditing.set(false);
  }

  submitReview(): void {
    if (this.reviewForm.invalid || this.submitting()) return;

    const rating = this.ratingControl.value!;
    const comment = this.commentControl.value!;
    const mine = this.userReview();
    this.submitting.set(true);

    const req$ = mine
      ? this.api.updateReview(mine.id, { rating, comment })
      : this.api.createReview(this.movieId, { rating, comment });

    req$.subscribe({
      next: (review) => {
        if (mine) {
          this.reviews.update(list => list.map(r => r.id === mine.id ? review : r));
          this.isEditing.set(false);
          this.toast.success('Review updated');
        } else {
          this.reviews.update(list => [review, ...list]);
          this.reviewForm.reset({ rating: 0, comment: '' });
          this.toast.success('Review submitted');
        }
        this.submitting.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to submit review');
        this.submitting.set(false);
      }
    });
  }

  confirmDelete(): void {
    const mine = this.userReview();
    if (!mine) return;

    this.api.deleteReview(mine.id).subscribe({
      next: () => {
        this.reviews.update(list => list.filter(r => r.id !== mine.id));
        this.reviewForm.reset({ rating: 0, comment: '' });
        this.isEditing.set(false);
        this.toast.success('Review deleted');
      },
      error: () => this.toast.error('Failed to delete review')
    });
  }
}
