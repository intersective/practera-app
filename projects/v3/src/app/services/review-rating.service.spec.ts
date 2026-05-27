import { ReviewRatingService } from './review-rating.service';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApolloService } from './apollo.service';

describe('ReviewRatingService', () => {
  let service: ReviewRatingService;
  let apolloSpy: jasmine.SpyObj<ApolloService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReviewRatingService,
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['graphQLMutate'])
        },
      ]
    });
    service = TestBed.inject(ReviewRatingService);
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('submitRating()', () => {
    it('calls apolloService.graphQLMutate with the submitReviewRating mutation', () => {
      apolloSpy.graphQLMutate.and.returnValue(of({ data: { submitReviewRating: { success: true } } }));

      service.submitRating({
        assessment_review_id: 1,
        rating: 4.5,
        comment: 'Great feedback',
        tags: ['helpful']
      }).subscribe();

      expect(apolloSpy.graphQLMutate).toHaveBeenCalledTimes(1);
      const [mutation, variables] = apolloSpy.graphQLMutate.calls.mostRecent().args;
      expect(mutation).toContain('submitReviewRating');
      expect(variables).toEqual({
        assessmentReviewId: 1,
        rating: 4.5,
        comment: 'Great feedback',
        tags: ['helpful'],
      });
    });

    it('passes the assessmentReviewId as a number (coerced by GQL resolver)', () => {
      apolloSpy.graphQLMutate.and.returnValue(of({}));
      service.submitRating({ assessment_review_id: 99, rating: 3, comment: '', tags: [] }).subscribe();
      const [, variables]: any[] = apolloSpy.graphQLMutate.calls.mostRecent().args;
      expect(variables.assessmentReviewId).toBe(99);
    });
  });
});
