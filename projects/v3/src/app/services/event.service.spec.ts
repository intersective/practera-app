import { TestBed } from '@angular/core/testing';
import { EventService } from './event.service';
import { of } from 'rxjs';
import { RequestService } from 'request';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { TestUtils } from '@testingv3/utils';
import { BrowserStorageService } from '@v3/services/storage.service';
import { ApolloService } from '@v3/services/apollo.service';
import dayjs from 'dayjs';

describe('EventService', () => {
  let service: EventService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let apolloSpy: jasmine.SpyObj<ApolloService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let utils: UtilsService;
  const testUtils = new TestUtils();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'delete', 'post', 'apiResponseFormatError'])
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['graphQLMutate', 'graphQLFetch'])
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['modal'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            setBookedEventActivityIds: () => { },
            removeBookedEventActivityIds: () => { },
            initBookedEventActivityIds: () => { }
          })
        },
      ]
    });
    service = TestBed.inject(EventService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
    utils = TestBed.inject(UtilsService);
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
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
    assessment: null,
    allDay: false
  };

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
        data: {
          events: Array.from({ length: startTimes.length }, (x, i) => {
            return {
              id: i + 1,
              name: 'event' + i,
              description: 'des' + i,
              location: 'location' + i,
              activityId: 2,
              activityName: 'activity2',
              eventStart: startTimes[i],
              eventEnd: startTimes[i],
              capacity: 10,
              remainingCapacity: 1,
              isBooked: false,
              singleBooking: true,
              canBook: true,
              assessment: null,
              videoConference: null,
              type: null,
              isAllDay: false
            };
          })
        }
      };
      formatted = requestResponse.data.events.map(event => {
        return {
          id: event.id,
          name: event.name,
          description: event.description,
          location: event.location,
          activityId: event.activityId,
          activityName: event.activityName,
          startTime: event.eventStart,
          endTime: event.eventEnd,
          capacity: event.capacity,
          remainingCapacity: event.remainingCapacity,
          isBooked: event.isBooked,
          singleBooking: event.singleBooking,
          canBook: event.canBook,
          isPast: utils.timeComparer(event.eventStart) < 0,
          assessment: null,
          videoConference: null,
          type: null,
          allDay: event.isAllDay
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
        apolloSpy.graphQLFetch.and.returnValue(of(tmpRes));
        service.getEvents().subscribe();
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
        expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual(errMsg);
      });

      it('Event format error', () => {
        tmpRes.data.events = {};
        errMsg = 'Event format error';
      });
      it('Event object format error', () => {
        tmpRes.data.events[0] = {};
        errMsg = 'Event object format error';
      });
    });

    it('should get correct data', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(requestResponse));
      service.getEvents(2).subscribe(res => expect(res).toEqual(expected));
    });

    it('should get correct multi day events', () => {
      const multiDayEvent = {
        id: 7,
        name: 'event6',
        description: 'des6',
        location: 'location6',
        activityId: 2,
        activityName: 'activity2',
        eventStart: testUtils.getDateString(2, 1),
        eventEnd: testUtils.getDateString(4, 1),
        capacity: 10,
        remainingCapacity: 1,
        isBooked: false,
        singleBooking: true,
        canBook: true,
        assessment: null,
        videoConference: null,
        type: null,
        isAllDay: false
      };
      requestResponse.data.events[7] = multiDayEvent;
      const dateDifference = (utils.getDateDifference(multiDayEvent.eventStart, multiDayEvent.eventEnd) + 1);
      const multiDayEvents: Array<Event> = [];
      let eventObj = null;
      for (let index = 0; index < dateDifference; index++) {
        const startTime = dayjs(utils.iso8601Formatter(multiDayEvent.eventStart));
        eventObj = {
          id: multiDayEvent.id,
          name: multiDayEvent.name,
          description: multiDayEvent.description,
          location: multiDayEvent.location,
          activityId: multiDayEvent.activityId,
          activityName: multiDayEvent.activityName,
          startTime: multiDayEvent.eventStart,
          endTime: multiDayEvent.eventEnd,
          capacity: multiDayEvent.capacity,
          remainingCapacity: multiDayEvent.remainingCapacity,
          isBooked: multiDayEvent.isBooked,
          singleBooking: multiDayEvent.singleBooking,
          canBook: multiDayEvent.canBook,
          isPast: utils.timeComparer(multiDayEvent.eventStart) < 0,
          assessment: multiDayEvent.assessment,
          videoConference: multiDayEvent.videoConference,
          type: multiDayEvent.type,
          allDay: true,
          isMultiDay: true,
          multiDayInfo: {
            startTime: startTime.add(index, 'day').format('YYYY-MM-DD hh:mm:ss'),
            endTime: multiDayEvent.eventEnd,
            dayCount: `(Day ${index + 1}/${dateDifference})`,
            id: `E${multiDayEvent.id}${index + 1}`,
            isMiddleDay: true
          }
        };
        if (index === 0) {
          eventObj.multiDayInfo.startTime = multiDayEvent.eventStart;
          eventObj.multiDayInfo.isMiddleDay = false;
          eventObj.allDay = multiDayEvent.isAllDay;
        }
        if (index === (dateDifference - 1)) {
          eventObj.allDay = multiDayEvent.isAllDay;
          eventObj.multiDayInfo.isMiddleDay = false;
        }
        multiDayEvents.push(eventObj);
      }
      expected = [
        formatted[2],
        formatted[1],
        formatted[3],
        multiDayEvents[0],
        multiDayEvents[1],
        multiDayEvents[2],
        formatted[4],
        formatted[0],
        formatted[5],
      ];
      apolloSpy.graphQLFetch.and.returnValue(of(requestResponse));
      service.getEvents(2).subscribe(res => {
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
      requestResponse = { data: { id: 1 } };
      expected = true;
    });

    it(`should return false if there's no submission`, () => {
      requestResponse = {};
      expected = false;
    });
  });

  describe('when testing getActivities()', () => {
    const activities = Array.from({ length: 4 }, (x, i) => ({
      id: i + 1,
      name: 'activity' + i
    }));
    const requestResponse = { data: { milestones: [{ activities }] } };
    const expected = activities.slice();

    it('returns empty array when milestones is missing', () => {
      apolloSpy.graphQLFetch.and.returnValue(of({ data: {} }));
      service.getActivities().subscribe(res => expect(res).toEqual([]));
    });

    it(`should return correct data`, () => {
      apolloSpy.graphQLFetch.and.returnValue(of(requestResponse));
      service.getActivities().subscribe(res => expect(res).toEqual(expected));
    });
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
      const sameDay = testUtils.getDateString(5, 1);
      tmpEvent.startTime = testUtils.getDateString(1, 1);
      tmpEvent.endTime = sameDay;
      tmpEvent.multiDayInfo.startTime = sameDay;
      const time = service.timeDisplayed(tmpEvent);
      expect(time).toEqual(`Until ${utils.utcToLocal(tmpEvent.endTime, 'time')}`);
    });

    it(`should return time if event is not multiday`, () => {
      tmpEvent.startTime = testUtils.getDateString(1, 1);
      const time = service.timeDisplayed(tmpEvent);
      expect(time).toEqual(`${utils.utcToLocal(tmpEvent.startTime, 'time')} - ${utils.utcToLocal(tmpEvent.endTime, 'time')}`);
    });
  });

  describe('bookEvent()', () => {
    it('calls apolloService.graphQLMutate with the bookEvent mutation', () => {
      apolloSpy.graphQLMutate.and.returnValue(of({ data: { bookEvent: { success: true } } }));
      service.bookEvent(mockEvent).subscribe();
      expect(apolloSpy.graphQLMutate).toHaveBeenCalledTimes(1);
      const [mutation, variables] = apolloSpy.graphQLMutate.calls.mostRecent().args;
      expect(mutation).toContain('bookEvent');
      expect(variables).toEqual({
        eventId: mockEvent.id,
        deletePrevious: mockEvent.singleBooking ?? false,
      });
    });
  });

  describe('cancelEvent()', () => {
    it('calls apolloService.graphQLMutate with the cancelEvent mutation', () => {
      apolloSpy.graphQLMutate.and.returnValue(of({ data: { cancelEvent: { success: true } } }));
      service.cancelEvent(mockEvent).subscribe();
      expect(apolloSpy.graphQLMutate).toHaveBeenCalledTimes(1);
      const [mutation, variables] = apolloSpy.graphQLMutate.calls.mostRecent().args;
      expect(mutation).toContain('cancelEvent');
      expect(variables).toEqual({ eventId: mockEvent.id });
    });
  });

});
