import { Component, Input } from '@angular/core';
import { EventsService, Event } from '@app/events/events.service';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  selector: 'event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent {
  @Input() events: Array<Event>;
  constructor(
    private notificationService: NotificationService
  ) {}

  showEventDetail(event) {
    // this.notificationService.eventDetail(event);
  }

}
