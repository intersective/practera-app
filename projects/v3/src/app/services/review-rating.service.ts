import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApolloService } from './apollo.service';

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
    private apolloService: ApolloService,
  ) { }

  submitRating(data: ReviewRating): Observable<any> {
    return this.apolloService.graphQLMutate(
      `mutation submitReviewRating(
        $assessmentReviewId: ID!,
        $rating: Float!,
        $comment: String,
        $tags: [String]
      ) {
        submitReviewRating(
          assessmentReviewId: $assessmentReviewId,
          rating: $rating,
          comment: $comment,
          tags: $tags
        ) {
          success
        }
      }`,
      {
        assessmentReviewId: data.assessment_review_id,
        rating: data.rating,
        comment: data.comment,
        tags: data.tags,
      }
    );
  }
}
