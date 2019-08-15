import { Component } from '@angular/core';
import { ReviewsService, Review } from './reviews.service';
import { Router } from '@angular/router';
import { UtilsService } from '../services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent {

  public routeUrl = '/app/reviews';
  public reviews: Array<Review> = [];
  public showDone = false;
  public loadingReviews = true;

  constructor(
    public reviewsService: ReviewsService,
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
  ) {
  }

  onEnter() {
    this.loadingReviews = true;
    this.showDone = false;
    this.reviewsService.getReviews()
      .subscribe(reviews => {
        this.reviews = reviews;
        this.loadingReviews = false;
      });
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
