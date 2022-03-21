import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Review, ReviewListService } from '@v3/services/review-list.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.page.html',
  styleUrls: ['./review-list.page.scss'],
})
export class ReviewListPage implements OnInit {
  public reviews: Array<Review> = [];
  public showDone = false;
  public loadingReviews = true;
  @Input() submissionId: number;
  @Output() navigate = new EventEmitter();
  @Input() review$: Subject<any>;

  constructor(
    public reviewsService: ReviewListService,
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
    private notificationsService: NotificationsService,
  ) { }

  ngOnInit() {
    this.onEnter();
    this.review$.subscribe(review => {
      console.log('ReviewListPage::current', review);
    });
  }

  onEnter() {
    this.loadingReviews = true;
    this.showDone = false;
    this.reviewsService.getReviews()
      .subscribe(
        reviews => {
          this.reviews = reviews;
          this.loadingReviews = false;
          this.gotoFirstReview();
        },
        err => {
          const toasted = this.notificationsService.alert({
            header: 'Error retrieving latest reviews',
            message: err.msg || JSON.stringify(err)
          });
          throw new Error(err);
        }
      );
  }

  /**
   * Go to the first review of the review list for desktop
   */
  gotoFirstReview() {
    if (this.utils.isMobile()) {
      return;
    }
    let review;
    if (this.submissionId) {
      // go to the review if submission id is passed in
      review = this.reviews.find(re => re.submissionId === this.submissionId);
    } else {
      // go to the first review if submission id is not passed in
      review = this.reviews.find(re => re.isDone === this.showDone);
    }
    if (!review) {
      return this.navigate.emit();
    }
    this.gotoReview(review.contextId, review.assessmentId, review.submissionId);
  }

  /**
   * Go to a review
   * @param contextId
   * @param assessmentId
   * @param submissionId
   */
  gotoReview(contextId, assessmentId, submissionId) {
    if (this.utils.isMobile()) {
      // navigate to the assessment page for mobile
      return this.router.navigate(['assessment', 'review', contextId, assessmentId, submissionId, { from: 'reviews' }]);
    }
    // emit the navigate event to the parent event for desktop
    return this.navigate.emit({
      assessmentId: assessmentId,
      submissionId: submissionId,
      contextId: contextId
    });
  }

  /**
   * Click the To Do tab
   */
  clickToDo() {
    if (!this.showDone) {
      return;
    }
    this.showDone = false;
    this.submissionId = null;
    this.gotoFirstReview();
  }

  /**
   * Click the Done tab
   */
  clickDone() {
    if (this.showDone) {
      return;
    }
    this.showDone = true;
    this.submissionId = null;
    this.gotoFirstReview();
  }

  noReviewsToDo() {
    const reviewTodo = this.reviews.find(review => {
      return review.isDone === false;
    });
    return !reviewTodo && !this.showDone;
  }

  noReviewsDone() {
    const reviewDone = this.reviews.find(review => {
      return review.isDone === true;
    });
    return !reviewDone && this.showDone;
  }
}
