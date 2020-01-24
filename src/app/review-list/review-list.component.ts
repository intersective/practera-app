import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReviewListService, Review } from './review-list.service';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '../shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent {
  public reviews: Array<Review> = [];
  public showDone = false;
  public loadingReviews = true;
  @Input() submissionId: number;
  @Output() navigate = new EventEmitter();

  constructor(
    public reviewsService: ReviewListService,
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
    private newRelic: NewRelicService,
    private notificationService: NotificationService,
  ) {}

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
          this.newRelic.noticeError('get reviews fail', JSON.stringify(err));
          const toasted = this.notificationService.alert({
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
      return ;
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
      return this.router.navigate(['assessment', 'review', contextId, assessmentId, submissionId, {from: 'reviews'}]);
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
      return ;
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
      return ;
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
