import { Component } from '@angular/core';
import { ReviewsService, Review } from './reviews.service';
import { Router } from '@angular/router';
import { RouterEnter } from '@services/router-enter.service';
import { UtilsService } from '../services/utils.service';
import { NotificationService } from '../shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent extends RouterEnter {

  public routeUrl = '/app/reviews';
  public reviews: Array<Review> = [];
  public showDone = false;
  public loadingReviews = true;

  constructor(
    public reviewsService: ReviewsService,
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
    private newRelic: NewRelicService,
    private notificationService: NotificationService,
  ) {
    super(router);
  }

  onEnter() {
    this.loadingReviews = true;
    this.showDone = false;
    this.reviewsService.getReviews()
      .subscribe(
        reviews => {
          this.reviews = reviews;
          this.loadingReviews = false;
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

  gotoReview(contextId, assessmentId, submissionId) {
    this.router.navigate(['assessment', 'review', contextId, assessmentId, submissionId, {from: 'reviews'}]);
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
