import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Event, EventsService } from "@app/events/events.service";

@Component({
  selector: 'event-detail',
  templateUrl: 'event-detail.component.html',
  styleUrls: ['event-detail.component.scss']
})
export class EventDetailComponent {
  event: Event;
  constructor(
    public modalController: ModalController,
    public eventsService: EventsService
  ) {}

  confirmed() {
    if (this.event.isBooked) {
      this.eventsService.cancelEvent(this.event);
    } else {
      // this.eventsService.bookEvent(this.event);
    }
    this.modalController.dismiss();
    location.reload();
  }
}
