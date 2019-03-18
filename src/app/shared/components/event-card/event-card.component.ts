import { Component, Input } from '@angular/core';
import { Event, EventsService } from '@app/events/events.service';

@Component({
  selector: 'event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent {
  @Input() event: Event;
  @Input() time: string;
  constructor(
    private eventsService: EventsService
  ) {}

  showEventDetail() {
    this.eventsService.eventDetailPopUp(this.event);
  }

}
