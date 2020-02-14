import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { Event } from '@app/event-list/event-list.service';
import { EventDetailService } from './event-detail.service';
import { NotificationService } from '@shared/notification/notification.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: 'event-detail.component.html',
  styleUrls: ['event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  @Input() event: Event;
  // indicate that user wanna go to the checkin assessment
  @Output() checkin = new EventEmitter();
  // CTA button is acting or not
  ctaIsActing = false;
  constructor(
    private router: Router,
    public modalController: ModalController,
    public eventDetailService: EventDetailService,
    private notificationService: NotificationService,
    public utils: UtilsService,
    private newRelic: NewRelicService,
    private storage: BrowserStorageService,
  ) {}

  ngOnInit() {
    this.ctaIsActing = false;
    this.newRelic.setPageViewName('event-detail');
  }

  confirmed() {
    this.newRelic.addPageAction(`Action: ${this.buttonText()}`);
    this.ctaIsActing = true;
    switch (this.buttonText()) {
      case 'Book':
        // we only show the single booking pop up if user has booked an event under the same activity
        if (this.event.singleBooking && this.storage.getBookedEventActivityIds().includes(this.event.activityId)) {
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
                role: 'cancel',
                handler: () => {
                  this.ctaIsActing = false;
                }
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
              message: 'Booking cancelled Successfully!',
              buttons: [
                {
                  text: 'OK',
                  role: 'cancel'
                }
              ]
            });
            // update the event list & activity detail page
            this.utils.broadcastEvent('update-event', null);
            this.event.isBooked = false;
            // remove the activity id from storage if it is single booking
            if (this.event.singleBooking) {
              this.storage.removeBookedEventActivityIds(this.event.activityId);
            }
          }
          this.ctaIsActing = false;
        });
        break;

      case 'Check In':
      case 'View Check In':
        if (this.utils.isMobile()) {
          this.router.navigate(['assessment', 'event', this.event.assessment.contextId, this.event.assessment.id]);
        } else {
          // tell parent component to go to check in assessment
          this.checkin.emit({
            assessmentId: this.event.assessment.id,
            contextId: this.event.assessment.contextId
          });
        }
        this.ctaIsActing = false;
        break;
    }
    if (this.utils.isMobile()) {
      this.modalController.dismiss();
    }
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
        this.event.isBooked = true;
        // save the activity id if it is single booking
        if (this.event.singleBooking) {
          this.storage.setBookedEventActivityIds(this.event.activityId);
        }
        this.ctaIsActing = false;
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
        this.ctaIsActing = false;
      }
    );
  }

  buttonText() {
    // for not booked event
    if (!this.event.isBooked) {
      // for expired event
      if (this.event.isPast) {
        return 'Expired';
      }
      if (this.event.remainingCapacity > 0 && this.event.canBook) {
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
