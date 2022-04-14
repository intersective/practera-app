import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AssessmentReview } from '@v3/app/services/assessment.service';
import { Review } from '@v3/services/review-list.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { Subject } from 'rxjs';

enum STATUSES {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent implements OnInit {
  @Input() reviews: Review[];
  public showDone = false;
  @Input() loadingReviews: boolean;
  @Input() submissionId: number;
  @Output() navigate = new EventEmitter();
  selectedReview: any = {};

  public status: string = STATUSES.PENDING;

  testBoolean = 0;

  constructor(
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
  ) { }

  ngOnInit() {
    this.onEnter();
  }

  onEnter() {
    this.showDone = false;
  }

  statusUpdate(event) {
    console.log(event);
    this.status = event.detail.value;
  }

  // open a review in detailed page
  read(review: Review) {
    console.log('REVIEW::', review);
    this.testBoolean = this.testBoolean === 0 ? 1 : 0;
    this.navigate.emit(review);
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
