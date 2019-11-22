import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ReviewRatingService, ReviewRating } from './review-rating.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '../shared/notification/notification.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-review-rating',
  templateUrl: './review-rating.component.html',
  styleUrls: ['./review-rating.component.scss']
})
export class ReviewRatingComponent implements OnInit {

  // Default redirect i.e home page.
  redirect = ['/'];

  ratingData: ReviewRating = {
    assessment_review_id: null,
    rating : 0.5,
    comment: '',
    tags: []
  };
  // variable to control the button text to indicate rating
  isSubmitting = false;

  constructor(
    private reviewRatingService: ReviewRatingService,
    private modalController: ModalController,
    private router: Router,
    private utils: UtilsService,
    private notificationService: NotificationService,
    private newRelic: NewRelicService
  ) {}

  // Review ID is required if this component is to be used.upon detecting incoming/changes of value, set passed reviewId into local var
  @Input()
  set reviewId(reviewId: number) {
    this.ratingData.assessment_review_id = reviewId;
  }

  ngOnInit() {
    this.newRelic.setPageViewName('review-rating');
  }

  submitReviewRating() {
    const nrSubmitRatingTracer = this.newRelic.createTracer('submit rating');
    this.newRelic.addPageAction(`Submit rating: ${this.ratingData.rating}`);
    this.isSubmitting = true;
    // round to 2 decimal place
    this.ratingData.rating = +(this.ratingData.rating.toFixed(2));

    this.reviewRatingService.submitRating(this.ratingData).subscribe(
      result => {
        nrSubmitRatingTracer();
        this.isSubmitting = false;
        this._closeReviewRating();
      },
      err => {
        nrSubmitRatingTracer();
        this.newRelic.noticeError('Submit review fail', JSON.stringify(err));
        const toasted = this.notificationService.alert({
          header: 'Error submitting rating',
          message: err.msg || JSON.stringify(err)
        });

        throw new Error(err);
      }
    );
  }

  private _closeReviewRating() {
    this.modalController.dismiss();
    // if this.redirect == false, don't redirect to another page
    if (!this.redirect) {
      return ;
    }
    if (!this.utils.isMobile()) {
      // go to the desktop view pages
      if (this.redirect.includes('assessment')) {
        return this.router.navigate([
          'app',
          'activity',
          this.redirect[2],
          {
            task: 'assessment',
            task_id: this.redirect[4],
            context_id: this.redirect[3]
          }
        ]);
      }
      if (this.redirect.includes('topic')) {
        return this.router.navigate([
          'app',
          'activity',
          this.redirect[1],
          {
            task: 'topic',
            task_id: this.redirect[2]
          }
        ]);
      }
    }
    this.router.navigate(this.redirect);
  }

  addOrRemoveTags(tag) {
    this.newRelic.addPageAction(`added/removed: ${tag}`);
    this.ratingData.tags = this.utils.addOrRemove(this.ratingData.tags, tag);
  }

}
