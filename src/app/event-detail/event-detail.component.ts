import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
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
    private router: Router,
    public modalController: ModalController,
    public eventDetailService: EventDetailService,
    private notificationService: NotificationService,
    public utils: UtilsService
  ) {}

  confirmed() {
    switch (this.buttonText()) {
      case 'Book':
        if (this.event.singleBooking) {
          this.notificationService.alert({
            message: 'Booking this event will cancel your booking for other events within the same activity, do you still wanna book?',
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this._bookEvent();
                }
              },
              {
                text: 'Cancel',
                role: 'cancel'
              }
            ]
          });
        } else {
          this._bookEvent();
        }
        break;

      case 'Cancel Booking':
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
        break;

      case 'Check In':
      case 'View Check In':
        this.router.navigate(['assessment', 'event', this.event.assessment.contextId, this.event.assessment.id]);
        break;
    }
    this.modalController.dismiss();
  }

  private _bookEvent() {
    this.eventDetailService.bookEvent(this.event).subscribe(
      response => {
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
      },
      error => {
        this.notificationService.alert({
          message: 'Booking failed, please try again later!',
          buttons: [
            {
              text: 'OK',
              role: 'cancel'
            }
          ]
        });
      }
    );
  }

  buttonText() {
    // for not booked event
    if (!this.event.isBooked) {
      if (!this.event.isPast && this.event.remainingCapacity > 0) {
        return 'Book';
      }
      return false;
    }
    // can only cancel booking before event start
    if (!this.event.isPast) {
      return 'Cancel Booking';
    }
    // for event that doesn't have check in
    if (!this.utils.has(this.event, 'assessment.id')) {
      return false;
    }
    // for event that have check in
    if (this.event.assessment.isDone) {
      return 'View Check In';
    }
    return 'Check In';
  }

  close() {
    this.modalController.dismiss();
  }
}
