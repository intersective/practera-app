import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RequestService } from 'request';
import { UtilsService } from '@v3/services/utils.service';
import { DemoService } from './demo.service';
import { ApolloService } from './apollo.service';
import { environment } from '@v3/environments/environment';
import { map, shareReplay } from 'rxjs/operators';

export interface Review {
  assessmentId: number;
  submissionId: number;
  isDone: boolean;
  name: string;
  submitterName: string;
  date?: string;
  teamName?: string;
  contextId: number;
  status?: string;
  icon?: string;
  submitter?: string;
  team?: string;
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
    private apolloService: ApolloService,
  ) { }

  getReviews() {
    if (environment.demo) {
      return this.demoService.getReviews().subscribe(res => this._normaliseLegacyReviews(res));
    }
    return this.apolloService.graphQLFetch(`
      query reviews {
        reviews {
          id
          isDone
          modifiedDate
          createdDate
          status
          assessment {
            id
            name
          }
          submission {
            id
            contextId
            submitter {
              name
            }
            team {
              name
            }
          }
        }
      }
    `).pipe(map(response => {
      if (response?.data?.reviews) {
        return this._normaliseGqlReviews(response.data.reviews);
      }
      return [];
    })).subscribe();
  }

  private _normaliseGqlReviews(data: any[]): Review[] {
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Reviews format error');
      return [];
    }
    const reviews: Review[] = [];
    data.forEach(review => {
      if (!review?.assessment?.id || !review?.submission?.id) {
        return;
      }
      reviews.push({
        assessmentId: review.assessment.id,
        submissionId: review.submission.id,
        isDone: review.isDone ?? false,
        name: review.assessment.name ?? '',
        submitterName: review.submission?.submitter?.name ?? '',
        date: this.utils.timeFormatter(
          review.isDone ? review.modifiedDate : (review.createdDate ?? review.modifiedDate)
        ),
        teamName: review.submission?.team?.name,
        contextId: review.submission.contextId,
        status: review.status,
      });
    });
    this._reviews$.next(reviews);
    return reviews;
  }

  private _normaliseLegacyReviews(response): Review[] {
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
        teamName: review.AssessmentSubmission?.Team?.name,
        contextId: review.AssessmentSubmission.context_id,
      });
    });

    this._reviews$.next(reviews);
    return reviews;
  }

}
