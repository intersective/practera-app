import { Component, Input, OnInit } from '@angular/core';
import { Event, EventListService } from '@app/event-list/event-list.service';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnInit {
  @Input() event: Event;
  @Input() time: string;
  // if it is for todo item
  @Input() layout: string;
  constructor(
    private eventsService: EventListService,
    private utils: UtilsService
  ) {}

  showEventDetail() {
    // only show pop up for mobile
    if (!this.utils.isMobile()) {
      return ;
    }
    this.eventsService.eventDetailPopUp(this.event);
  }

  ngOnInit() {

  }

  isPast() {
    if (!this.event.isPast) {
      return false;
    }
    if (!this.event.isBooked) {
      return true;
    }
    if (!this.utils.has(this.event, 'assessment.id')) {
      return true;
    }
    if (this.event.assessment.isDone) {
      return true;
    }
    return false;
  }

}
