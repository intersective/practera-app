import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@v3/shared/request/request.service';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { EventDetailComponent } from '@v3/pages/events/event-detail/event-detail.component';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  get: {
    events: 'api/v2/act/event/list.json',
    submissions: 'api/submissions.json',
    activities: 'api/v2/plan/activity/list.json'
  },
  post: {
    book: 'api/book_events.json'
  },
  delete: {
    cancel: 'api/book_events.json'
  }
};

export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  activityId: number;
  activityName: string;
  startTime: string;
  endTime: string;
  capacity: number;
  remainingCapacity: number;
  isBooked: boolean;
  singleBooking: boolean;
  canBook: boolean;
  allDay: boolean;
  isPast?: boolean;
  assessment?: {
    id: number;
    contextId: number;
    isDone: boolean;
  };
  videoConference?: {
    provider: string;
    url: string;
    meetingId: string;
    password: string
  };
  type?: string;
  isMultiDay?: boolean;
  multiDayInfo?: {
    startTime: string;
    endTime: string;
    dayCount: string;
    id: string;
    isMiddleDay: boolean;
  };
}

export interface EventGroup {
  date: string;
  events: Array<Event>;
}

export interface Activity {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})

export class EventService {
  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private notificationService: NotificationsService,
    private demo: DemoService
  ) {}

  /**
   *
   * @param activityId {number[]}
   * @returns {Observable}
   */
  getEvents(activityId?): Observable<any> {

    if (environment.demo) {
      return of(this.normaliseEvents(this.demo.eventList));
    }

    const params: any = {
      types: ['activity_session', 'other']
    };
    // getting events link with activity
    if (activityId) {
      params.activity_id = activityId;
      params.types = ['activity_session'];
    }

    return this.request.get(api.get.events, {params: params})
      .pipe(map(response => {
        return this.normaliseEvents(response.data);
      })
    );
  }

  normaliseEvents(data): Array<Event> {
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Event format error');
      return [];
    }
    let events: Array<Event> = [];
    this.storage.initBookedEventActivityIds();
    data.forEach(event => {
      if (!this.utils.has(event, 'id') ||
          !this.utils.has(event, 'title') ||
          !this.utils.has(event, 'description') ||
          !this.utils.has(event, 'activity_id') ||
          !this.utils.has(event, 'activity_name') ||
          !this.utils.has(event, 'location') ||
          !this.utils.has(event, 'start') ||
          !this.utils.has(event, 'end') ||
          !this.utils.has(event, 'capacity') ||
          !this.utils.has(event, 'remaining_capacity') ||
          !this.utils.has(event, 'is_booked') ||
          !this.utils.has(event, 'can_book') ||
          !this.utils.has(event, 'single_booking')) {
        // API respond format inconsistency error
        return this.request.apiResponseFormatError('Event object format error');
      }
      const eventObj = {
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
        isPast: this.utils.timeComparer(event.start) < 0,
        assessment: this.utils.has(event, 'assessment.id') ? {
          id: event.assessment.id,
          contextId: event.assessment.context_id,
          isDone: event.assessment.is_done || false
        } : null,
        videoConference: this.utils.has(event, 'video_conference.url') ? {
          provider: event.video_conference.provider,
          url: event.video_conference.url,
          meetingId: event.video_conference.meeting_id,
          password: event.video_conference.password
        } : null,
        type: event.type,
        allDay: event.all_day ? event.all_day : false
      };
      if (!this._checkIsSingleDay(eventObj) && (this.utils.timeComparer(eventObj.startTime) >= 0)) {
        events = events.concat(this._getMultiDayEvent(eventObj));
      } else {
        events.push(eventObj);
      }
      // set the booked event activity id if it is single booking activity and booked
      if (event.single_booking && event.is_booked) {
        this.storage.setBookedEventActivityIds(event.activity_id);
      }
    });
    return this._sortEvent(events);
  }

  getSubmission(assessmentId, contextId): Observable<any> {
    if (environment.demo) {
      return this.demo.assessment(33)
      .pipe(map(response => {
        return !this.utils.isEmpty(response.data.submissions[0]);
      }));
    }
    return this.request.get(api.get.submissions, {params: {
        assessment_id: assessmentId,
        context_id: contextId,
        review: false
      }})
      .pipe(map(response => {
        return !this.utils.isEmpty(response.data);
      })
    );
  }

  private _sortEvent(events) {
    return events.sort((a, b) => {
      const dateA = new Date((a.isMultiDay ? a.multiDayInfo.startTime : a.startTime) + 'Z');
      const dateB = new Date((b.isMultiDay ? b.multiDayInfo.startTime : b.startTime) + 'Z');
      const now = new Date();
      if (dateA.getTime() === dateB.getTime()) {
        return 0;
      }
      if (dateA.getTime() > now.getTime() && now.getTime() > dateB.getTime()) {
        return -1;
      }
      if (dateA.getTime() < now.getTime() && now.getTime() < dateB.getTime()) {
        return 1;
      }
      if (dateA.getTime() > now.getTime() && dateB.getTime() > now.getTime()) {
        return dateA.getTime() < dateB.getTime() ? -1 : 1;
      }
      if (dateA.getTime() < now.getTime() && dateB.getTime() < now.getTime()) {
        return dateA.getTime() > dateB.getTime() ? -1 : 1;
      }
    });
  }

  getActivities() {
    if (environment.demo) {
      return this.demo.activity()
      .pipe(map(response => {
        if (response.data) {
          return this._normaliseActivities(response.data);
        }
      }));
    }
    return this.request.get(api.get.activities)
      .pipe(map(response => {
        if (response.success && response.data) {
          return this._normaliseActivities(response.data);
        }
      }));
  }

  private _normaliseActivities(data): Array<Activity> {
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Activity array format error');
      return [];
    }

    return data.map(activity => {
      if (!this.utils.has(activity, 'id') ||
          !this.utils.has(activity, 'name')) {
        this.request.apiResponseFormatError('Activity format error');
        return null;
      }
      return {
        id: activity.id,
        name: activity.name
      };
      // sort activity by name alphabetically
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  eventDetailPopUp(event: Event) {
    return this.notificationService.modal(
      EventDetailComponent,
      { event },
      { cssClass: 'event-detail-popup' }
    );
  }

  /******************
    Function used for the event card
  ******************/

  /**
   * This is used to get the proper time information need to be displayed on card
   * @param event Event Object
   */
  timeDisplayed(event: Event): string {
    // display date only if it is a past event and is not booked
    if (this.utils.timeComparer(event.startTime) < 0 && !event.isBooked) {
      return this.utils.utcToLocal(event.startTime, 'date');
    }
    /**
     * According to requirements.
     * 1. we are not showing time for multi day event that are middle days (isMiddleDay is true).
     *  example: event start at 25th and end in 30th.
     *  - we show time for 25th event item and 30th day event item.
     *  - we are not showing time for 26th, 27th, 28th, 29th days event items.
     * 2. If event is all day but not multiday we show 'All Day'.
     * 3. If event is multiday and it's the starting day we only showing starting time.
     * 4. If event is multiday and it's the ending day we showing 'Until [end time]'.
     * 5. For any other condition show both starting time and end time.
     */
    if (event.isMultiDay && event.multiDayInfo && event.multiDayInfo.isMiddleDay) {
      return '';
    }
    if (event.allDay) {
      return 'All Day';
    }
    if (event.isMultiDay && (this.utils.utcToLocal(event.startTime, 'date') === this.utils.utcToLocal(event.multiDayInfo.startTime, 'date'))) {
      return this.utils.utcToLocal(event.startTime, 'time');
    }
    if (event.isMultiDay && (this.utils.utcToLocal(event.endTime, 'date') === this.utils.utcToLocal(event.multiDayInfo.startTime, 'date'))) {
      return `Until ${this.utils.utcToLocal(event.endTime, 'time')}`;
    }
    // otherwise display time only
    return `${this.utils.utcToLocal(event.startTime, 'time')} - ${this.utils.utcToLocal(event.endTime, 'time')}`;
  }

  /**
   * If the event is not actionable
   * @param event Event Object
   */
  isNotActionable(event: Event): boolean {
    if (!event.isPast) {
      return false;
    }
    if (!event.isBooked) {
      return true;
    }
    if (!this.utils.has(event, 'assessment.id')) {
      return true;
    }
    if (event.assessment.isDone) {
      return true;
    }
    return false;
  }

  /**
   * method checking is event single day or multi day.
   * @param event Formated event object
   * @returns {boolean} is event single day or not
   */
  private _checkIsSingleDay(event) {
    return this.utils.utcToLocal(event.startTime, 'date') === this.utils.utcToLocal(event.endTime, 'date');
  }

  /**
   * methos will create duplicate event objects to show in each day for multi day events.
   * @param event Formated event object
   * @returns {Array} multi day event object array
   */
  private _getMultiDayEvent(event) {
    const dateDifference = (this.utils.getDateDifference(event.startTime, event.endTime) + 1);
    const multiDayEvents: Array<Event> = [];
    let eventObj = null;
    for (let index = 0; index < dateDifference; index++) {
      eventObj = {
        id: event.id,
        name: event.name,
        description: event.description,
        location: event.location,
        activityId: event.activityId,
        activityName: event.activityName,
        startTime: event.startTime,
        endTime: event.endTime,
        capacity: event.capacity,
        remainingCapacity: event.remainingCapacity,
        isBooked: event.isBooked,
        singleBooking: event.singleBooking,
        canBook: event.canBook,
        isPast: event.isPast,
        assessment: event.assessment,
        videoConference: event.videoConference,
        type: event.type,
        allDay: true,
        isMultiDay: true,
        multiDayInfo: {
          startTime: this.utils.getFutureDated(event.startTime, index),
          endTime: event.endTime,
          dayCount: `(Day ${index + 1}/${dateDifference})`,
          id: `E${event.id}${index + 1}`,
          isMiddleDay: true
        }
      };
      if (index === 0) {
        eventObj.multiDayInfo.startTime = event.startTime;
        eventObj.multiDayInfo.isMiddleDay = false;
        eventObj.allDay = event.allDay;
      }
      if (index === (dateDifference - 1)) {
        eventObj.allDay = event.allDay;
        eventObj.multiDayInfo.isMiddleDay = false;
      }
      multiDayEvents.push(eventObj);
    }
    return multiDayEvents;
  }

  bookEvent(event: Event) {
    return this.request.post(
      {
        endPoint: api.post.book,
        data: {
          event_id: event.id,
          delete_previous: event.singleBooking
        }
      });
  }

  cancelEvent(event: Event) {
    return this.request.delete(api.delete.cancel, {
      params: {
        event_id: event.id
      }
    });
  }

}
