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
    events: 'api/v2/act/event/list.json'
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
  startTime: string;
  endTime: string;
  capacity: number;
  remainingCapacity: number;
  isBooked: boolean;
  isPast?: boolean;
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

  private _normaliseEvents(data) {
    if (!Array.isArray(data)) {
      return this.request.apiResponseFormatError('Event format error');
    }
    let events: Array<Event> = [];
    data.forEach(event => {
      if (!this.utils.has(event, 'id') ||
          !this.utils.has(event, 'title') ||
          !this.utils.has(event, 'description') ||
          !this.utils.has(event, 'activity_id') ||
          !this.utils.has(event, 'location') ||
          !this.utils.has(event, 'start') ||
          !this.utils.has(event, 'end') ||
          !this.utils.has(event, 'capacity') ||
          !this.utils.has(event, 'remaining_capacity') ||
          !this.utils.has(event, 'isBooked')) {
        return this.request.apiResponseFormatError('Event object format error');
      }
      let start = new Date(event.start);
      let now = new Date();
      events.push({
        id: event.id,
        name: event.title,
        description: event.description,
        location: event.location,
        activityId: event.activity_id,
        startTime: event.start,
        endTime: event.end,
        capacity: event.capacity,
        remainingCapacity: event.remaining_capacity,
        isBooked: event.isBooked,
        isPast: start.getTime() < now.getTime()
      });
    });
    return this._sortEvent(events);
  }

  private _sortEvent(events) {
    return events.sort((a, b) => {
      let dateA = new Date(a.startTime);
      let dateB = new Date(b.startTime);
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

  bookEvent(eventId) {
    let postData = {
      event_id: eventId,
      delete_previous: "no"
    };
    return this.request.post(api.post.book, postData).subscribe();
  }

  cancelEvent(eventId) {

  }
}
