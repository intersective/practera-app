import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';
import { EventService, Event } from '@v3/services/event.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';

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
    public eventService: EventService,
    private notificationService: NotificationsService,
    public utils: UtilsService,
    private storage: BrowserStorageService,
  ) {}

  ngOnInit() {
    this.ctaIsActing = false;
  }

  confirmed(event) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

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
        this.eventService.cancelEvent(this.event).subscribe(response => {
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
    this.eventService.bookEvent(this.event).subscribe(
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
      if (this.event.remainingCapacity === 0) {
        return 'Fully Booked';
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

  openMeetingLink(link) {
    window.open(link, '_system');
  }

  /**
   * Method will check event start date, end date, All Day and create the value need to show as date.
   * @returns {String} Event Date
   */
  getEventDate() {
    let startDate = null;
    let startTime = null;
    const endDate = this.utils.utcToLocal( this.event.endTime, 'date');
    const endTime = this.utils.utcToLocal( this.event.endTime, 'time');

    /**
     * According to requirements.
     * For multi day events details we are not showing 'Today', 'Tomorrow'.
     * - So if event is multi day event date will formated in here without send to util service,
     * because utill service convert date to 'Today', 'Tomorrow'.
     * - If the event is not multi day we need to show 'Today', Tomorrow'. because of that we pass it to utill service.
     */
    if (this.event.isMultiDay) {
      const dateObj = new Date(this.utils.iso8601Formatter(this.event.startTime));
      startTime = new Intl.DateTimeFormat('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
      }).format(dateObj);
      startDate = new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(dateObj);
    } else {
      startDate = this.utils.utcToLocal( this.event.startTime, 'date');
      startTime = this.utils.utcToLocal( this.event.startTime, 'time');
    }

    /**
     * According to requirements.
     * For multi day events detils.
     *  - If in main event details is All day we show "All Day".
     *  - If the event is just middle day of multi day event we are not puting "All Day"
     *  - for other multiday events we show start date and end date with start time and end time.
     * For single day event details.
     *  - If the event is All day we show "All Day".
     *  - If the event is not All day we show date with start and end time.
     */
    if (startDate !== endDate) {
      return this.event.allDay ? `${startDate}, All Day - ${endDate}, All Day` : `${startDate}, ${startTime} - ${endDate}, ${endTime}`;
    }
    return this.event.allDay ? `${startDate}, All Day` : `${startDate}, ${startTime} - ${endTime}`;
  }

}
