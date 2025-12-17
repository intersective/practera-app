import { TestBed } from '@angular/core/testing';
import { ReviewService } from './review.service';
import { of } from 'rxjs';
import { RequestService } from 'request';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { DemoService } from './demo.service';
import { NotificationsService } from './notifications.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReviewService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: DemoService,
          useValue: jasmine.createSpyObj('DemoService', ['getReviews']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['modalOnly']),
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', [
            'get', 'apiResponseFormatError'
          ]),
        },
      ]
    });
    service = TestBed.inject(ReviewService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    utils = TestBed.inject(UtilsService);
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getReviews()', () => {
    it('should return empty array if no response data.', () => {
      requestSpy.get.and.returnValue(of({}));
      expect(service.getReviews).toThrowError();
    });

    it('should return error if response data format error #1.', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: {}
      }));
      expect(service.getReviews).toThrowError();
    });

    it('should return error if response data format error #2.', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: [{
          Assessment: {}
        }]
      }));
      service.getReviews();
      service.reviews$.subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should get correct data.', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: [{
          Assessment: {
            id: 1,
            name: 'assessment'
          },
          AssessmentSubmission: {
            id: 2,
            context_id: 3,
            Submitter: { name: 'submitter' },
            Team: { name: 'team' }
          },
          AssessmentReview: {
            is_done: true,
            created: '2019-01-01 18:00:00',
            modified: '2019-01-01 19:00:00'
          }
        }]
      }));
      service.getReviews();
      service.reviews$.subscribe(res => {
        expect(res).toEqual([{
          assessmentId: 1,
          submissionId: 2,
          isDone: true,
          name: 'assessment',
          submitterName: 'submitter',
          date: utils.timeFormatter('2019-01-01 19:00:00'),
          teamName: 'team',
          contextId: 3,
        }]);
      });
    });
  });

  describe('when testing popUpReviewRating()', () => {
    it('should pass the correct data to notification modal', () => {
      service.popUpReviewRating(1, ['home']);
      expect(notificationSpy.modalOnly).toHaveBeenCalledTimes(1);
      expect(notificationSpy.modalOnly).toHaveBeenCalledWith(
        jasmine.any(Function), // ReviewRatingComponent
        {
          reviewId: 1,
          redirect: ['home']
        },
        {
          id: 'review-popup-1',
          backdropDismiss: false,
        }
      );
    });
  });
});
