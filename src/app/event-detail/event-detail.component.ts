import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '@services/utils.service';
import { Event } from '@app/events/events.service';
import { EventDetailService } from './event-detail.service';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  selector: 'event-detail',
  templateUrl: 'event-detail.component.html',
  styleUrls: ['event-detail.component.scss']
})
export class EventDetailComponent {
  event: Event;
  constructor(
    public modalController: ModalController,
    public eventDetailService: EventDetailService,
    private notificationService: NotificationService,
    public utils: UtilsService
  ) {}

  confirmed() {
    if (this.event.isBooked) {
      this.eventDetailService.cancelEvent(this.event).subscribe(response => {
        if (response.success) {
          this.notificationService.alert({
            message: 'Booking canceled Successfully!',
            buttons: [
              {
                text: 'OK',
                role: 'cancel'
              }
            ]
          });
          // update the event list & activity detail page
          this.utils.broadcastEvent('update-event', null);
        }
      });
    } else {
      this.eventDetailService.bookEvent(this.event).subscribe(response => {
        if (response.success) {
          this.notificationService.alert({
            message: 'Booked Successfully!',
            buttons: [
              {
                text: 'OK',
                role: 'cancel'
              }
            ]
          });
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
