import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';

const api = {
  reviews: 'api/reviews.json',
};

export interface Review {
  assessmentId: number,
  isDone: boolean,
  name: string,
  submitterName: string,
  date?: string,
  teamName?: string,
  contextId: number
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {

  constructor(
    private request: RequestService,
    private utils: UtilsService,
  ) { }

  getReviews(): Observable<any> {
    return this.request.get(api.reviews)
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseReviews(response.data);
        } else {
          return [];
        }
      })
    );
  }

  private _normaliseReviews(data) {
    if (!Array.isArray(data)) {
      return this.request.apiResponseFormatError('Reviews format error');
    }
    let reviews = [];
    data.forEach(review => {
      if (!this.utils.has(review, 'Assessment.id') ||
          !this.utils.has(review, 'Assessment.name') ||
          !this.utils.has(review, 'AssessmentReview.is_done') ||
          !this.utils.has(review, 'AssessmentSubmission.Submitter.name') ||
          !this.utils.has(review, 'AssessmentSubmission.context_id') ||
          !this.utils.has(review, 'AssessmentReview.created') ||
          !this.utils.has(review, 'AssessmentReview.modified')) {
        return this.request.apiResponseFormatError('Reviews object format error');
      }
      reviews.push({
        assessmentId: review.Assessment.id,
        isDone: review.AssessmentReview.is_done,
        name: review.Assessment.name,
        submitterName: review.AssessmentSubmission.Submitter.name,
        date: review.AssessmentReview.is_done ? review.AssessmentReview.modified : review.AssessmentReview.created,
        teamName: this.utils.has(review, 'AssessmentSubmission.Team.name') ? review.AssessmentSubmission.Team.name : '',
        contextId: review.AssessmentSubmission.context_id
      });
    });
    return reviews;
  }

}
