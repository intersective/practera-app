import { Injectable } from '@angular/core';
import { RequestService } from '@v3/shared/request/request.service';

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
