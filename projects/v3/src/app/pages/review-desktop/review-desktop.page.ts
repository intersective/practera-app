import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { Assessment, AssessmentReview, AssessmentService, Submission } from '@v3/app/services/assessment.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { UtilsService } from '@v3/services/utils.service';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-review-desktop',
  templateUrl: './review-desktop.page.html',
  styleUrls: ['./review-desktop.page.scss'],
})
export class ReviewDesktopPage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  loading: boolean; // loading indicator (true = loading | false = done loaded)
  savingText$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  btnDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  reviews: Review[];
  assessment: Assessment;
  submission: Submission;
  review: AssessmentReview;

  // the current review in the review list
  currentReview: Review;
  submissionId: number;
  noReview = false;

  constructor(
    readonly utils: UtilsService,
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private reviewService: ReviewService,
    private notificationsService: NotificationsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.updatePageTitle();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.ngZone.run(() => {
        this.updatePageTitle();
        this.cdr.markForCheck();
      });
    });
    this.assessmentService.assessment$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.ngZone.run(() => { this.assessment = res; this.cdr.markForCheck(); });
    });
    this.assessmentService.submission$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.ngZone.run(() => { this.submission = res; this.cdr.markForCheck(); });
    });
    this.assessmentService.review$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.ngZone.run(() => { this.review = res; this.cdr.markForCheck(); });
    });
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(_params => {
      this.reviewService.getReviews();
    });
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.ngZone.run(() => {
        this.submissionId = +params?.submissionId;
        this.cdr.markForCheck();
      });
    });
    this.reviewService.reviews$.pipe(takeUntil(this.destroy$)).subscribe(reviews => {
      this.ngZone.run(() => {
        this.reviews = reviews;
        if (this.utils.isEmpty(this.submissionId) || this.submissionId === 0) {
          this.gotoFirstReview(reviews);
        } else {
          this.goto(reviews.find(re => re.submissionId === this.submissionId));
        }
        this.cdr.markForCheck();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePageTitle(): void {
    // Ionic keeps this page subscribed while another tab is active.
    const segments = this.router.parseUrl(this.router.url).root.children[PRIMARY_OUTLET]?.segments || [];
    const routeSubmissionId = this.route.snapshot.paramMap.get('submissionId');
    const currentSubmissionId = segments[2]?.path || null;
    if (segments.length >= 2 && segments.length <= 3
      && segments[0].path === 'v3' && segments[1].path === 'review-desktop'
      && currentSubmissionId === routeSubmissionId) {
      this.utils.setPageTitle(this.currentReview ? this.currentReview.name || 'Review' : 'Reviews - Practera');
    }
  }

  /**
   * Go to the first review of the review list for desktop
   */
  gotoFirstReview(reviews: Review[]) {
    if (!reviews) {
      return ;
    }

    let review;
    if (this.submissionId) {
      // go to the review if submission id is passed in
      review = reviews.find(re => re.submissionId === this.submissionId);
    } else {
      // go to the first review if submission id is not passed in
      review = reviews.find(re => !re.isDone);
    }
    this.goto(review);
  }

  goto(review: Review) {
    this.currentReview = review;
    this.noReview = !review;
    this.updatePageTitle();
    if (!review) {
      return;
    }
    this.assessmentService.getAssessment(review.assessmentId, 'review', 0, review.contextId, review.submissionId);
  }

  async saveReview(event) {
    if (event.autoSave && this.loading) {
      return;
    }

    this.loading = true;
    this.btnDisabled$.next(true);
    this.savingText$.next('Saving...');
    try {
      const { submission } = await firstValueFrom(this.assessmentService
        .fetchAssessment(
          event.assessmentId,
          "review",
          null,
          this.currentReview.contextId,
          this.submission.id
        ));

      if (submission.status === 'pending review') {
        const res = await firstValueFrom(this.assessmentService.submitReview(
          this.assessment.id,
          this.review.id,
          this.submission.id,
          event.answers
        ));

        // [CORE-5876] - Fastfeedback is now added for reviewer
        if (this.assessment.pulseCheck === true && event.autoSave === false) {
          await this.assessmentService.pullFastFeedback();
        }

        await firstValueFrom(this.assessmentService.fetchAssessment(
          this.assessment.id,
          'review',
          0,
          this.currentReview.contextId,
          this.submission.id
        ));
        this.reviewService.getReviews();

        await firstValueFrom(this.notificationsService.getTodoItems()); // update notifications list

        // fail gracefully: Review submission API may sometimes fail silently
        if (res?.data?.submitReview === false) {
          this.savingText$.next($localize`Save failed.`);
          this.btnDisabled$.next(false);
          this.loading = false;
          return;
        }

        this.notificationsService.assessmentSubmittedToast({ isReview: true });
      } else {
        this.notificationsService.assessmentSubmittedToast({ isDuplicated: true });
      }

      this.loading = false;
      this.btnDisabled$.next(false);
    } catch (err) {
      this.savingText$.next($localize`Save Failed.`);
      this.loading = false;
      this.btnDisabled$.next(false);
      this.notificationsService.assessmentSubmittedToast({isFail: true});
    }
  }

}
