import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RequestService } from 'request';
import { UtilsService } from '@v3/services/utils.service';
import { DemoService } from './demo.service';
import { environment } from '@v3/environments/environment';
import { shareReplay } from 'rxjs/operators';

const api = {
  reviews: 'api/reviews.json',
};

export interface Review {
  assessmentId: number;
  submissionId: number;
  isDone: boolean;
  name: string;
  submitterName: string;
  date?: string;
  teamName?: string;
  contextId: number;
  status: string;
  icon: string;
  submitter: string;
  team: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private _reviews$ = new BehaviorSubject<Review[]>([]);
  reviews$ = this._reviews$.pipe(shareReplay(1));

  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private demoService: DemoService,
  ) { }

  getReviews() {
    if (environment.demo) {
      return this.demoService.getReviews().subscribe(res => this._normaliseReviews(res));
    }
    return this.request.get(api.reviews).subscribe(res => this._normaliseReviews(res));
  }

  private _normaliseReviews(response): Review[] {
    if (!response || !response.success || !response.data || !Array.isArray(response.data)) {
      throw this.request.apiResponseFormatError('Reviews format error');
    }

    const reviews = [];
    response.data.forEach(review => {
      if (!this.utils.has(review, 'Assessment.id') ||
          !this.utils.has(review, 'Assessment.name') ||
          !this.utils.has(review, 'AssessmentReview.is_done') ||
          !this.utils.has(review, 'AssessmentSubmission.Submitter.name') ||
          !this.utils.has(review, 'AssessmentSubmission.context_id') ||
          !this.utils.has(review, 'AssessmentSubmission.id') ||
          !this.utils.has(review, 'AssessmentReview.created') ||
          !this.utils.has(review, 'AssessmentReview.modified')) {
        return this.request.apiResponseFormatError('Reviews object format error');
      }
      reviews.push({
        assessmentId: review.Assessment.id,
        submissionId: review.AssessmentSubmission.id,
        isDone: review.AssessmentReview.is_done,
        name: review.Assessment.name,
        submitterName: review.AssessmentSubmission.Submitter.name,
        date: this.utils.timeFormatter(review.AssessmentReview.is_done ? review.AssessmentReview.modified : review.AssessmentReview.created),
        teamName: this.utils.has(review, 'AssessmentSubmission.Team.name') ? review.AssessmentSubmission.Team.name : '',
        contextId: review.AssessmentSubmission.context_id
      });
    });
    this._reviews$.next(reviews);
    return reviews;
  }

}
