import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assessment, AssessmentReview, AssessmentService, Submission } from '@v3/app/services/assessment.service';
import { Review, ReviewService } from '@v3/app/services/review.service';
import { UtilsService } from '@v3/services/utils.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-review-desktop',
  templateUrl: './review-desktop.page.html',
  styleUrls: ['./review-desktop.page.scss'],
})
export class ReviewDesktopPage implements OnInit {
  review$ = this.assessmentService.review$;
  reviews$ = this.reviewService.reviews$;
  submission$ = this.assessmentService.submission$;
  assessment$ = this.assessmentService.assessment$;
  loading: boolean; // loading indicator (true = loading | false = done loaded)
  savingText$: BehaviorSubject<string> = new BehaviorSubject<string>('');

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
  ) { }

  ngOnInit(): void {
    this.reviewService.reviews$.subscribe(res => this.reviews = res);
    this.assessmentService.assessment$.subscribe(res => this.assessment = res);
    this.assessmentService.submission$.subscribe(res => this.submission = res);
    this.assessmentService.review$.subscribe(res => this.review = res);
    this.submissionId = +this.route.snapshot.paramMap.get('submissionId');
    this.route.paramMap.subscribe(params => {
      this.reviewService.getReviews();
    });
    this.reviews$.subscribe(reviews => {
      if (this.utils.isEmpty(this.submissionId) || this.submissionId == 0) {
        this.gotoFirstReview(reviews);
      } else if (reviews.length > 0) { // handle directlink
        this.goto(reviews.find(re => re.submissionId === this.submissionId));
      }
    });
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
    if (!review) {
      this.noReview = true;
      return;
    }
    this.noReview = false;
    this.currentReview = review;
    this.assessmentService.getAssessment(review.assessmentId, 'review', 0, review.contextId, review.submissionId);
  }

  async saveAssessment(event) {
    this.loading = true;
    this.savingText$.next('Saving...');
    await this.assessmentService.saveAnswers(
      event.assessment,
      event.answers,
      event.action,
      this.assessment.pulseCheck
    ).toPromise();
    if (!event.assessment.inProgress) {
      setTimeout(
        () => this.reviewService.getReviews(),
        500
      );
    }

    this.loading = false;
    this.savingText$.next('Last saved ' + this.utils.getFormatedCurrentTime());
  }

}
