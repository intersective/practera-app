import { TestBed } from '@angular/core/testing';
import { EventListService } from './event-list.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { TestUtils } from '@testing/utils';
import { BrowserStorageService } from '@services/storage.service';
import { Apollo } from 'apollo-angular';

describe('EventListService', () => {
  let service: EventListService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let utils: UtilsService;
  const testUtils = new TestUtils();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Apollo,
        EventListService,
        UtilsService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['modal'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            setBookedEventActivityIds: () => {},
            removeBookedEventActivityIds: () => {},
            initBookedEventActivityIds: () => {}
          })
        },
      ]
    });
    service = TestBed.inject(EventListService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    utils = TestBed.inject(UtilsService);
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getEvents()', () => {
    let startTimes;
    let requestResponse;
    let formatted;
    let expected;

    beforeEach(() => {
      startTimes = [
        testUtils.getDateString(-2, 0),
        testUtils.getDateString(2, 1),
        testUtils.getDateString(2, 0),
        testUtils.getDateString(2, 1),
        testUtils.getDateString(-2, 1),
        testUtils.getDateString(-2, -1)
      ];
      requestResponse = {
        success: true,
        data: Array.from({length: startTimes.length}, (x, i) => {
          return {
            id: i + 1,
            title: 'event' + i,
            description: 'des' + i,
            location: 'location' + i,
            activity_id: 2,
            activity_name: 'activity2',
            start: startTimes[i],
            end: startTimes[i],
            capacity: 10,
            remaining_capacity: 1,
            is_booked: false,
            single_booking: true,
            can_book: true,
            assessment: null,
            video_conference: null
          };
        })
      };
      formatted = requestResponse.data.map(event => {
        return {
          id: event.id,
          name: event.title,
          description: event.description,
          location: event.location,
          activityId: event.activity_id,
          activityName: event.activity_name,
          startTime: event.start,
          endTime: event.end,
          capacity: event.capacity,
          remainingCapacity: event.remaining_capacity,
          isBooked: event.is_booked,
          singleBooking: event.single_booking,
          canBook: event.can_book,
          isPast: utils.timeComparer(event.start) < 0,
          assessment: null,
          videoConference: null
        };
      });
      expected = [formatted[2], formatted[1], formatted[3], formatted[4], formatted[0], formatted[5]];
    });

    describe('should throw format error', () => {
      let tmpRes;
      let tmpExpected;
      let errMsg;
      beforeEach(() => {
        tmpRes = JSON.parse(JSON.stringify(requestResponse));
        tmpExpected = JSON.parse(JSON.stringify(expected));
      });
      afterEach(() => {
        requestSpy.get.and.returnValue(of(tmpRes));
        service.getEvents().subscribe();
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
        expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual(errMsg);
      });

      it('Event format error', () => {
        tmpRes.data = {};
        errMsg = 'Event format error';
      });
      it('Event object format error', () => {
        tmpRes.data[0] = {id: 11};
        errMsg = 'Event object format error';
      });
    });

    it('should get correct data', () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getEvents(2).subscribe(res => expect(res).toEqual(expected));
    });
  });

  describe('when testing getSubmission()', () => {
    let requestResponse;
    let expected;
    afterEach(() => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getSubmission(1, 2).subscribe(res => expect(res).toEqual(expected));
    });

    it(`should return true if there's submission`, () => {
      requestResponse = {data: {id: 1}};
      expected = true;
    });

    it(`should return false if there's no submission`, () => {
      requestResponse = {};
      expected = false;
    });
  });

  describe('when testing getActivities()', () => {
    const requestResponse = {
      success: true,
      data: Array.from({length: 4}, (x, i) => {
        return {
          id: i + 1,
          name: 'activity' + i
        };
      })
    };
    const expected = requestResponse.data;

    describe('should throw format error', () => {
      let tmpRes;
      let errMsg;
      beforeEach(() => {
        tmpRes = JSON.parse(JSON.stringify(requestResponse));
      });
      afterEach(() => {
        requestSpy.get.and.returnValue(of(tmpRes));
        service.getActivities().subscribe();
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
        expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual(errMsg);
      });

      it('Activity array format error', () => {
        tmpRes.data = {};
        errMsg = 'Activity array format error';
      });
    });

    it(`should return correct data`, () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getActivities().subscribe(res => expect(res).toEqual(expected));
    });
  });

  it('when testing eventDetailPopUp(), it should pop up the modal', () => {
    service.eventDetailPopUp(null);
    expect(notificationSpy.modal.calls.count()).toBe(1);
  });
});
