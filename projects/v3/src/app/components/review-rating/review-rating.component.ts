import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ReviewRatingService, ReviewRating } from '@v3/services/review-rating.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';

@Component({
  selector: 'app-review-rating',
  templateUrl: './review-rating.component.html',
  styleUrls: ['./review-rating.component.scss']
})
export class ReviewRatingComponent implements OnInit {
  moods = [
    {
      icon: 'mood_bad',
      description: $localize`Very Poor`,
      score: 0,
    },
    {
      icon: 'sentiment_dissatisfied',
      description: $localize`Poor`,
      score: 0.25,
    },
    {
      icon: 'sentiment_neutral',
      description: $localize`Average`,
      score: 0.5,
    },
    {
      icon: 'sentiment_satisfied',
      description: $localize`Good`,
      score: 0.75,
    },
    {
      icon: 'mood',
      description: $localize`Excellent`,
      score: 1,
    },
  ];
  moodSelected: number;
  ratingSessionEnd: boolean = false;

  // Default redirect i.e home page.
  @Input() redirect = ['/'];

  // Review ID is required if this component is to be used.upon detecting incoming/changes of value, set passed reviewId into local var
  @Input() reviewId: number;

  ratingData: ReviewRating = {
    assessment_review_id: null,
    rating : null,
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
    private notificationsService: NotificationsService,
    readonly fastFeedbackService: FastFeedbackService,
  ) {}

  ngOnInit(): void {
    this.ratingData.assessment_review_id = this.reviewId;
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  async submitReviewRating() {
    if (this.ratingData?.rating === undefined || this.moodSelected === undefined) {
      return;
    }

    this.isSubmitting = true;
    // round to 2 decimal place
    this.ratingData.rating = +(this.ratingData.rating.toFixed(2));

    try {
      await this.reviewRatingService.submitRating(this.ratingData).toPromise();
      this.isSubmitting = false;
      this.ratingSessionEnd = true;
    } catch (err) {
      await this.notificationsService.alert({
        header: $localize`Error submitting rating`,
        message: err.msg ? $localize`Apologies for the inconvenience caused. Something went wrong. Error: ${err.msg}` : JSON.stringify(err),
      });
      this.isSubmitting = false;

      throw new Error(err);
    }
  }

  private async fastFeedbackOrRedirect(): Promise<any> {
    // if this.redirect == false, don't redirect to another page
    if (!this.redirect) {
      return await this.fastFeedbackService.pullFastFeedback().toPromise();
    }

    if (!this.utils.isMobile()) {
      // go to the desktop view pages
      if (this.redirect.includes('assessment')) {
        return this.router.navigate([
          'v3',
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
          'v3',
          'activity',
          this.redirect[1],
          {
            task: 'topic',
            task_id: this.redirect[2]
          }
        ]);
      }
    }

    return this.router.navigate(this.redirect);
  }

  addOrRemoveTags(tag) {
    this.ratingData.tags = this.utils.addOrRemove<any[]>(this.ratingData.tags, tag);
  }

  rateMood(mood: number): void {
    this.moodSelected = mood;
    this.ratingData.rating = this.moods[mood].score;
  }

  async dismissModal(): Promise<void> {
    await this.modalController.dismiss(null, 'cancel', `review-popup-${this.reviewId}`);
    await this.fastFeedbackOrRedirect();
  }
}
