import { ReviewRatingService } from './review-rating.service';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';

describe('ReviewRatingService', () => {
  let service: ReviewRatingService;
  let requestSpy: jasmine.SpyObj<RequestService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReviewRatingService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['delete', 'post', 'get'])
        },
      ]
    });
    service = TestBed.inject(ReviewRatingService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('when testing submitRating()', () => {
    requestSpy.post.and.returnValue(of(''));
    service.submitRating({
      assessment_review_id: 1,
      rating: 0.4,
      comment: '',
      tags: []
    }).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });
});

