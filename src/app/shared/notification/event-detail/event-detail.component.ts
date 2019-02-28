import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '@services/utils.service';
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
    public eventsService: EventsService,
    private utils: UtilsService
  ) {}

  confirmed() {
    if (this.event.isBooked) {
      this.eventsService.cancelEvent(this.event).subscribe(response => {
        if (response.success) {
          // update the event list & activity detail page
          this.utils.broadcastEvent('update-event', null);
        }
      });
    } else {
      this.eventsService.bookEvent(this.event).subscribe(response => {
        if (response.success) {
          // update the event list & activity detail page
          this.utils.broadcastEvent('update-event', null);
        }
      });
    }
    this.modalController.dismiss();
  }

  close() {
    this.modalController.dismiss();
  }
}
