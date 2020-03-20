import { TestBed } from '@angular/core/testing';
import { FastFeedbackSubmitterService } from './fast-feedback-submitter.service';
import { of, throwError } from 'rxjs';
import { RequestService } from '@shared/request/request.service';

describe('FastFeedbackSubmitterService', () => {
  let service: FastFeedbackSubmitterService;
  let requestSpy: jasmine.SpyObj<RequestService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FastFeedbackSubmitterService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post'])
        }
      ]
    });
    service = TestBed.inject(FastFeedbackSubmitterService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should submit fastfeedback', () => {
    requestSpy.post.and.returnValue(of({}));
    service.submit({}, {}).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });

});
