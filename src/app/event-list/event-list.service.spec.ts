import { TestBed } from '@angular/core/testing';
import { EventListService } from './event-list.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { TestUtils } from '@testing/utils';
import { BrowserStorageService } from '@services/storage.service';
import { Apollo } from 'apollo-angular';
import * as moment from 'moment';

describe('EventListService', () => {
  moment.updateLocale('en', {
    monthsShort: [
      // customised shortened month to accommodate Intl date format
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
    ]
  });
  let service: EventListService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let utils: UtilsService;
  const testUtils = new TestUtils();
  const thisMoment = moment();

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
            video_conference: null,
            type: null,
            all_day: false
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
          videoConference: null,
          type: null,
          allDay: event.all_day
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

    it('should get correct multi day events', () => {
      const multiDayEvent = {
        id: 7,
        title: 'event' + 6,
        description: 'des' + 6,
        location: 'location' + 6,
        activity_id: 2,
        activity_name: 'activity2',
        start: testUtils.getDateString(2, 1),
        end: testUtils.getDateString(4, 1),
        capacity: 10,
        remaining_capacity: 1,
        is_booked: false,
        single_booking: true,
        can_book: true,
        assessment: null,
        video_conference: null,
        type: null,
        all_day: false
      };
      requestResponse.data[7] = multiDayEvent;
      const dateDifference = (utils.getDateDifference(multiDayEvent.start, multiDayEvent.end) + 1);
      const multiDayEvents: Array<Event> = [];
      let eventObj = null;
      for (let index = 0; index < dateDifference; index++) {
        const startTime = moment(utils.iso8601Formatter(multiDayEvent.start));
        eventObj = {
          id: multiDayEvent.id,
          name: multiDayEvent.title,
          description: multiDayEvent.description,
          location: multiDayEvent.location,
          activityId: multiDayEvent.activity_id,
          activityName: multiDayEvent.activity_name,
          startTime: multiDayEvent.start,
          endTime: multiDayEvent.end,
          capacity: multiDayEvent.capacity,
          remainingCapacity: multiDayEvent.remaining_capacity,
          isBooked: multiDayEvent.is_booked,
          singleBooking: multiDayEvent.single_booking,
          canBook: multiDayEvent.can_book,
          isPast: utils.timeComparer(multiDayEvent.start) < 0,
          assessment: multiDayEvent.assessment,
          videoConference: multiDayEvent.video_conference,
          type: multiDayEvent.type,
          allDay: true,
          isMultiDay: true,
          multiDayInfo: {
            startTime: startTime.clone().add(index, 'day').format('YYYY-MM-DD hh:mm:ss'),
            endTime: multiDayEvent.end,
            dayCount: `(Day ${index + 1}/${dateDifference})`,
            id: `E${multiDayEvent.id}${index + 1}`,
            isMiddleDay: true
          }
        };
        if (index === 0) {
          eventObj.multiDayInfo.startTime = multiDayEvent.start;
          eventObj.multiDayInfo.isMiddleDay = false;
          eventObj.allDay = multiDayEvent.all_day;
        }
        if (index === (dateDifference - 1)) {
          eventObj.allDay = multiDayEvent.all_day;
          eventObj.multiDayInfo.isMiddleDay = false;
        }
        multiDayEvents.push(eventObj);
      }
      expected = [formatted[2], formatted[1], formatted[3], multiDayEvents[0], multiDayEvents[1], multiDayEvents[2], formatted[4], formatted[0], formatted[5]];
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getEvents(2).subscribe(res => {
        console.log('res', res);
        console.log('expected', expected);
        expect(res).toEqual(expected);
      });
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

  describe('when testing timeDisplayed()', () => {
    const tmpEvent = {
      activityId: 2,
      activityName: 'activity2',
      allDay: false,
      assessment: null,
      canBook: true,
      capacity: 10,
      description: 'des6',
      endTime: testUtils.getDateString(5, 1),
      id: 7,
      isBooked: false,
      isMultiDay: true,
      isPast: false,
      location: 'location6',
      multiDayInfo: {
        dayCount: '(Day 1/2)',
        endTime: testUtils.getDateString(5, 1),
        id: 'E71',
        startTime: testUtils.getDateString(2, 1),
        isMiddleDay: false
      },
      name: 'event6',
      remainingCapacity: 1,
      singleBooking: true,
      startTime: testUtils.getDateString(2, 1),
      type: null,
      videoConference: null,
    };

    afterEach(() => {
      tmpEvent.startTime = testUtils.getDateString(2, 1);
      tmpEvent.multiDayInfo.startTime = testUtils.getDateString(2, 1);
      tmpEvent.allDay = false;
      tmpEvent.isMultiDay = true;
      tmpEvent.multiDayInfo.isMiddleDay = false;
    });

    it('should return date if event expired', () => {
      tmpEvent.startTime = testUtils.getDateString(-2, 1);
      const time = service.timeDisplayed(tmpEvent);
      expect(time).toEqual(utils.utcToLocal(tmpEvent.startTime, 'date'));
    });

    it(`should return 'All Day' if event mark as all day and multi day is false`, () => {
      tmpEvent.allDay = true;
      tmpEvent.isMultiDay = false;
      const time = service.timeDisplayed(tmpEvent);
      expect(time).toEqual('All Day');
    });

    it(`should return '' if event mark as middle day and multi day is true`, () => {
      tmpEvent.multiDayInfo.isMiddleDay = true;
      const time = service.timeDisplayed(tmpEvent);
      expect(time).toEqual('');
    });

    it(`should return time if event is multiday, start time and multi day start time same`, () => {
      const time = service.timeDisplayed(tmpEvent);
      expect(time).toEqual(utils.utcToLocal(tmpEvent.startTime, 'time'));
    });

    it(`should return 'Until time' if event is multiday, end time and multi day start time same`, () => {
      tmpEvent.startTime = testUtils.getDateString(1, 1);
      tmpEvent.multiDayInfo.startTime = testUtils.getDateString(5, 1);
      const time = service.timeDisplayed(tmpEvent);
      expect(time).toEqual(`Until ${utils.utcToLocal(tmpEvent.startTime, 'time')}`);
    });

    it(`should return time if event is not multiday`, () => {
      tmpEvent.startTime = testUtils.getDateString(1, 1);
      const time = service.timeDisplayed(tmpEvent);
      expect(time).toEqual(`${utils.utcToLocal(tmpEvent.startTime, 'time')} - ${utils.utcToLocal(tmpEvent.endTime, 'time')}`);
    });
  });
});
