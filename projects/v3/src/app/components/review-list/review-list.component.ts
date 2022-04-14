import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AssessmentReview } from '@v3/app/services/assessment.service';
import { Review } from '@v3/app/services/review.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
})
export class ReviewListComponent implements OnInit {
  @Input() reviews: Review[];
  @Input() currentReview: Review;
  @Output() navigate = new EventEmitter();
  public showDone = false;

  constructor(
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
  ) { }

  ngOnInit() {
    this.showDone = false;
  }

  // go to the review
  goto(review: Review) {
    this.navigate.emit(review);
  }

  switchStatus() {
    this.showDone = !this.showDone;
    this.navigate.emit(this.reviews.find(review => {
      return review.isDone === this.showDone;
    }));
  }

  // /**
  //  * Go to a review
  //  * @param contextId
  //  * @param assessmentId
  //  * @param submissionId
  //  */
  // gotoReview(contextId, assessmentId, submissionId) {
  //   if (this.utils.isMobile()) {
  //     // navigate to the assessment page for mobile
  //     return this.router.navigate(['assessment', 'review', contextId, assessmentId, submissionId, { from: 'reviews' }]);
  //   }
  //   // emit the navigate event to the parent event for desktop
  //   return this.navigate.emit({
  //     assessmentId: assessmentId,
  //     submissionId: submissionId,
  //     contextId: contextId
  //   });
  // }

  // return the message if there is no review to display
  get noReviews() {
    if (this.reviews === null) {
      return '';
    }
    const review = this.reviews.find(review => {
      return review.isDone === this.showDone;
    });
    if (review) {
      return '';
    }
    return this.showDone ? 'completed' : 'pending';
  }
}
