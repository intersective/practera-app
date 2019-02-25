import { Component, Input } from '@angular/core';
import { EventsService, Event } from '@app/events/events.service';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  selector: 'event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent {
  @Input() event: Event;
  constructor(
    private notificationService: NotificationService
  ) {}

  showEventDetail() {
    // this.notificationService.eventDetail(this.event);
  }

}
