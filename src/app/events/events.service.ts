import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  get: {
    events: 'api/v2/act/event/list.json',
    activities: 'api/v2/plan/activity/list.json'
  },
  post: {
    book: 'api/book_events.json'
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
  isPast?: boolean;
}

export interface Activity {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})

export class EventsService {
  constructor(
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
  ) {}

  getEvents(): Observable<any> {
    return this.request.get(api.get.events, {params: {
        type: 'activity_session'
      }})
      .pipe(map(response => {
        return this._normaliseEvents(response.data);
      })
    );
  }

  private _normaliseEvents(data): Array<Event> {
    if (!Array.isArray(data)) {
      this.request.apiResponseFormatError('Event format error');
      return [];
    }
    let events: Array<Event> = [];
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
          !this.utils.has(event, 'isBooked')) {
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
        isBooked: event.isBooked,
        isPast: this.utils.timeComparer(event.start) < 0
      });
    });
    return this._sortEvent(events);
  }

  private _sortEvent(events) {
    return events.sort((a, b) => {
      let dateA = new Date(a.startTime + 'Z');
      let dateB = new Date(b.startTime + 'Z');
      let now = new Date();
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
        return dateA.getTime() > dateB.getTime();
      }
      if (dateA.getTime() < now.getTime() && dateB.getTime() < now.getTime()) {
        return dateA.getTime() < dateB.getTime();
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
    });
  }

  bookEvent(event: Event) {
    let postData = {
      event_id: event.id,
      delete_previous: "no"
    };
    return this.request.post(api.post.book, postData).subscribe();
  }

  cancelEvent(event: Event) {

  }
}
