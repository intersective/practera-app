import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventsService, Event } from './events.service';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';

interface eventGroup {
  date: string;
  events: Array<Event>;
}

@Component({
  selector: 'app-events',
  templateUrl: 'events.component.html',
  styleUrls: ['events.component.scss']
})

export class EventsComponent extends RouterEnter {
  routeUrl: string = '/events';
  events: Array<eventGroup>;
  eventsCategorised: {
    browse: Array<eventGroup>;
    booked: Array<eventGroup>;
    attended: Array<eventGroup>;
  };
  loadingEvents: boolean = true;
  activated: string = 'browse';

  constructor (
    public router: Router,
    private eventService: EventsService,
    public utils: UtilsService
  ) {
    super(router);
  }

  private _initialise() {
    this.events = [];
    this.eventsCategorised = {
      browse: [],
      booked: [],
      attended: []
    }
    this.loadingEvents = true;
    this.activated = 'browse';
  }

  onEnter() {
    this._initialise();
    this.eventService.getEvents().subscribe(events => {
      this.events = [];
      if (this.utils.isEmpty(events)) {
        this.loadingEvents = false;
        return;
      }
      // initialise the date to compare with
      let compareDateBrowse = '';
      let compareDateBooked = '';
      let compareDateAttended = '';
      // initialise the event object
      let eventGroupBrowse = {
        date: compareDateBrowse,
        events: []
      }
      let eventGroupBooked = {
        date: compareDateBooked,
        events: []
      }
      let eventGroupAttended = {
        date: compareDateAttended,
        events: []
      }
      events.forEach(event => {
        if (!event.isBooked) {
          // group event for 'browse' type
          [this.eventsCategorised.browse, eventGroupBrowse, compareDateBrowse] = this._groupEvents(event, this.eventsCategorised.browse, eventGroupBrowse, compareDateBrowse, true);
        } else if (this.utils.timeComparer(event.endTime) >= 0) {
          // group event for 'booked' type
          [this.eventsCategorised.booked, eventGroupBooked, compareDateBooked] = this._groupEvents(event, this.eventsCategorised.booked, eventGroupBooked, compareDateBooked);
        } else {
          // group event for 'attended' type
          [this.eventsCategorised.attended, eventGroupAttended, compareDateAttended] = this._groupEvents(event, this.eventsCategorised.attended, eventGroupAttended, compareDateAttended);
        }
      });
      if (eventGroupBrowse.events.length) {
        this.eventsCategorised.browse.push(eventGroupBrowse);
      }
      if (eventGroupBooked.events.length) {
        this.eventsCategorised.booked.push(eventGroupBooked);
      }
      if (eventGroupAttended.events.length) {
        this.eventsCategorised.attended.push(eventGroupAttended);
      }
      this.events = this.eventsCategorised[this.activated];
      this.loadingEvents = false;
    })
  }

  /**
   * This function is used to put events into the proper group
   * @param {Event} event          The event data
   * @param {Array} events         The events array to push group data to
   * @param {Array} eventGroup     The event group array
   * @param {String} compareDate   The compare date string
   * @param {Boolean} isBrowse     If this is for browse (will group all past events in "Expired")
   */
  private _groupEvents(event, events, eventGroup, compareDate, isBrowse = false) {
    let date = this.utils.utcToLocal(event.startTime, 'date');
    // initialise compareDate & eventGroup
    if (!compareDate) {
      compareDate = date;
      eventGroup = {
        date: compareDate,
        events: []
      };
    }
    if (isBrowse && this.utils.timeComparer(event.startTime) < 0) {
      // group all past events as one group named "Expired"
      if (compareDate !== 'Expired') {
        compareDate = 'Expired';
        events.push(eventGroup);
        eventGroup = {
          date: compareDate,
          events: []
        }
      }
      eventGroup.events.push(event);
    } else if (date === compareDate) {
      // this event belongs to the same group as previous one
      eventGroup.events.push(event);
    } else {
      // create a new group for this date
      events.push(eventGroup);
      compareDate = this.utils.utcToLocal(event.startTime, 'date');
      eventGroup = {
        date: compareDate,
        events: [event]
      }
    }
    return [events, eventGroup, compareDate];
  }

  timeDisplayed(event) {
    if (this.utils.timeComparer(event.startTime) < 0) {
      return this.utils.utcToLocal(event.startTime, 'date');
    }
    return this.utils.utcToLocal(event.startTime, 'time') + ' - ' + this.utils.utcToLocal(event.endTime, 'time');
  }

  back() {
    this.router.navigate(['app', 'home']);
  }

  showBrowse() {
    this.activated = 'browse';
    this.events = this.eventsCategorised[this.activated];
  }
  showBooked() {
    this.activated = 'booked';
    this.events = this.eventsCategorised[this.activated];
  }
  showAttended() {
    this.activated = 'attended';
    this.events = this.eventsCategorised[this.activated];
  }
}
