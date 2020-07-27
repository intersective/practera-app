import { TestBed } from '@angular/core/testing';
import { EventDetailService } from './event-detail.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { TestUtils } from '@testing/utils';
import { Apollo } from 'apollo-angular';

describe('EventDetailService', () => {
  let service: EventDetailService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  const testUtils = new TestUtils();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Apollo,
        EventDetailService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['delete', 'post'])
        },
      ]
    });
    service = TestBed.inject(EventDetailService) as jasmine.SpyObj<EventDetailService>;
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const mockEvent = {
    id: 1,
    name: 'event',
    description: 'des',
    location: 'location',
    activityId: 2,
    activityName: 'activity2',
    startTime: testUtils.getDateString(-2, 0),
    endTime: testUtils.getDateString(-2, 0),
    capacity: 10,
    remainingCapacity: 1,
    isBooked: false,
    singleBooking: true,
    canBook: true,
    isPast: true,
    assessment: null
  };

  it('should pass correct parameter to bookEvent()', () => {
    requestSpy.post.and.returnValue(of({}));
    service.bookEvent(mockEvent).subscribe();
    expect(requestSpy.post.calls.first().args[1]).toEqual({
      event_id: mockEvent.id,
      delete_previous: mockEvent.singleBooking
    });
  });

  it('should pass correct parameter to cancelEvent()', () => {
    requestSpy.delete.and.returnValue(of({}));
    service.cancelEvent(mockEvent).subscribe();
    expect(requestSpy.delete.calls.first().args[1]).toEqual({params: {
        event_id: mockEvent.id
      }
    });
  });

});
