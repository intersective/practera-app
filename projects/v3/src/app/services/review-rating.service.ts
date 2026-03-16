import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { RequestService } from 'request';
import { environment } from '@v3/environments/environment';

const api = {
  post: {
    reviewRating: 'api/v2/observations/review_rating/create.json',
  }
};

export interface ReviewRating {
  assessment_review_id: number;
  rating: number;
  comment: string;
  tags: Array<string>;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewRatingService {

  constructor(
    private request: RequestService,
  ) { }

  submitRating(data: ReviewRating) {
    if (environment.demo) {
      return of({ success: true });
    }
    const postData = {
      assessment_review_id: data.assessment_review_id,
      rating: data.rating,
      comment: data.comment,
      tags: data.tags
    };

    return this.request.post(
      {
        endPoint: api.post.reviewRating,
        data: postData
      });
  }
}
