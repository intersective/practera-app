import { Component } from '@angular/core';
import { ReviewsService, Review } from './reviews.service';
import { Router } from '@angular/router';
import { RouterEnter } from '@services/router-enter.service';
import { UtilsService } from '../services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent extends RouterEnter {

  public routeUrl = '/app/reviews'
  public reviews: Array<Review> = [];
  public showDone: boolean = false;
  public loadingReviews: boolean = true;

  constructor(
    public reviewsService: ReviewsService,
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
  ) {
    super(router);
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

}
