import { TestBed } from '@angular/core/testing';
import { ReviewListService } from './review-list.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';

describe('ReviewListService', () => {
  let service: ReviewListService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReviewListService,
        UtilsService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'apiResponseFormatError'])
        },
      ]
    });
    service = TestBed.inject(ReviewListService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    utils = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getReviews()', () => {
    it('should return empty array if no response data.', () => {
      requestSpy.get.and.returnValue(of({}));
      service.getReviews().subscribe(res => {
        expect(res).toEqual([]);
      });
    });

    it('should return error if response data format error #1.', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: {}
      }));
      service.getReviews().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    it('should return error if response data format error #2.', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: [{
          Assessment: {}
        }]
      }));
      service.getReviews().subscribe();
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
      service.getReviews().subscribe(res => {
        expect(res).toEqual([{
          assessmentId: 1,
          submissionId: 2,
          isDone: true,
          name: 'assessment',
          submitterName: 'submitter',
          date: utils.timeFormatter('2019-01-01 19:00:00'),
          teamName: 'team',
          contextId: 3
        }]);
      });
    });
  });

});
