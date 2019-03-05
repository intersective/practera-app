import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
import { Event } from '@app/events/events.service';

const api = {
  post: {
    book: 'api/book_events.json'
  },
  delete: {
    cancel: 'api/book_events.json'
  }
};

@Injectable({
  providedIn: 'root'
})
export class EventDetailService {

  constructor(
    private request: RequestService,
  ) {}

  bookEvent(event: Event) {
    return this.request.post(api.post.book, {
      event_id: event.id,
      delete_previous: 'no'
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
