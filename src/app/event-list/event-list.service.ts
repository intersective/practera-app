import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { NotificationService } from '@shared/notification/notification.service';
import { EventDetailComponent } from '@app/event-detail/event-detail.component';

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
  isPast?: boolean;
  assessment?: {
    id: number;
    contextId: number;
    isDone: boolean;
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

export class EventListService {
  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private notificationService: NotificationService
  ) {}

  getEvents(activityId?): Observable<any> {
    let params = {};
    if (activityId) {
      params = {
        type: 'activity_session',
        activity_id: activityId
      };
    } else {
      params = {
        type: 'activity_session'
      };
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
    const events: Array<Event> = [];
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
        return this.request.apiResponseFormatError('Event object format error');
      }
      events.push({
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
        } : null
      });
      // set the booked event activity id if it is single booking activity and booked
      if (event.single_booking && event.is_booked) {
        this.storage.setBookedEventActivityIds(event.activity_id);
      }
    });
    return this._sortEvent(events);
  }

  getSubmission(assessmentId, contextId): Observable<any> {
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
      const dateA = new Date(a.startTime + 'Z');
      const dateB = new Date(b.startTime + 'Z');
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
    // otherwise display time only
    return this.utils.utcToLocal(event.startTime, 'time') + ' - ' + this.utils.utcToLocal(event.endTime, 'time');
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
}
