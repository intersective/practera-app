import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastController, LoadingController } from '@ionic/angular';
import {
  ContributionService,
  PendingContributionRating,
  ContributionRatingInput,
} from '@v3/services/contribution.service';
import { UtilsService } from '@v3/services/utils.service';

interface MemberRating {
  userId: number;
  name: string;
  score: number | null;
  notPresent: boolean;
}

@Component({
  standalone: false,
  selector: 'app-contribution-rating',
  templateUrl: './contribution-rating.page.html',
  styleUrls: ['./contribution-rating.page.scss'],
})
export class ContributionRatingPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  pending: PendingContributionRating[] = [];
  loading = true;

  /** Currently active prompt index */
  currentIndex = 0;

  /** Per-member rating state for the current event */
  ratings: MemberRating[] = [];

  submitting = false;
  allDone = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contributionService: ContributionService,
    private utils: UtilsService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
  ) {}

  get current(): PendingContributionRating | null {
    return this.pending[this.currentIndex] ?? null;
  }

  get totalPending(): number {
    return this.pending.length;
  }

  ngOnInit() {
    this.utils.setPageTitle('Rate Your Meeting - Practera');
    this.load();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load() {
    this.loading = true;
    this.contributionService
      .getPendingRatings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: pending => {
          this.loading = false;
          this.pending = pending.filter(p => p.targets.some(t => !t.alreadyRated));
          if (this.pending.length === 0) {
            this.allDone = true;
          } else {
            this.currentIndex = 0;
            this.initRatings();
          }
        },
        error: () => {
          this.loading = false;
          this.allDone = true;
        },
      });
  }

  private initRatings() {
    const current = this.current;
    if (!current) return;
    this.ratings = current.targets
      .filter(t => !t.alreadyRated)
      .map(t => ({ userId: t.userId, name: t.name, score: null, notPresent: false }));
  }

  setScore(userId: number, score: number) {
    const m = this.ratings.find(r => r.userId === userId);
    if (!m) return;
    m.score = m.score === score ? null : score;
    if (m.score !== null) m.notPresent = false;
  }

  toggleNotPresent(userId: number) {
    const m = this.ratings.find(r => r.userId === userId);
    if (!m) return;
    m.notPresent = !m.notPresent;
    if (m.notPresent) m.score = null;
  }

  isValid(): boolean {
    return this.ratings.every(r => r.notPresent || r.score !== null);
  }

  scoreLabel(score: number): string {
    const labels: Record<number, string> = {
      1: 'Poor',
      2: 'Below avg',
      3: 'Average',
      4: 'Good',
      5: 'Excellent',
    };
    return labels[score] ?? '';
  }

  async submit() {
    if (!this.current || !this.isValid()) return;

    this.submitting = true;
    const input: ContributionRatingInput[] = this.ratings.map(r => ({
      targetUserId: r.userId,
      score: r.notPresent ? null : r.score,
      notPresent: r.notPresent,
    }));

    this.contributionService
      .submitContributions(this.current.eventId, input)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.submitting = false;
          if (result.success) {
            this.advance();
          } else {
            this.showToast(result.message ?? 'Failed to submit ratings');
          }
        },
        error: (err) => {
          this.submitting = false;
          this.showToast(err?.message ?? 'Failed to submit ratings');
        },
      });
  }

  skipCurrent() {
    this.advance();
  }

  private advance() {
    if (this.currentIndex < this.pending.length - 1) {
      this.currentIndex++;
      this.initRatings();
    } else {
      this.allDone = true;
    }
  }

  done() {
    this.router.navigate(['/v3/events']);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'dark',
    });
    await toast.present();
  }
}
