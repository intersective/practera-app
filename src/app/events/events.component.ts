import { Component, Input, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventsService, Event, Activity } from './events.service';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';


interface EventGroup {
  date: string;
  events: Array<Event>;
}

@Component({
  selector: 'app-events',
  templateUrl: 'events.component.html',
  styleUrls: ['events.component.scss']
})

export class EventsComponent extends RouterEnter {
  routeUrl = '/events';
  events: Array<EventGroup> = [];
  eventsCategorised: {
    browse: Array<EventGroup>;
    booked: Array<EventGroup>;
    attended: Array<EventGroup>;
  };
  activities: Array<Activity>;
  selectedActivities: Array<number>;
  loadingEvents = true;
  activated = 'browse';

  constructor (
    public router: Router,
    private route: ActivatedRoute,
    private eventService: EventsService,
    public utils: UtilsService,
    private ngZone: NgZone,
    private newRelic: NewRelicService
  ) {
    super(router);
    // update event list after book/cancel an event
    this.utils.getEvent('update-event').subscribe(event => {
      this.onEnter();
    });
  }

  private _initialise() {
    this.events = [];
    this.eventsCategorised = {
      browse: [],
      booked: [],
      attended: []
    };
    this.activities = [];
    this.selectedActivities = [];
    this.loadingEvents = true;
    this.activated = 'browse';
  }

  onEnter() {
    this.newRelic.setPageViewName('event-list');

    this._initialise();
    this.eventService.getEvents().subscribe(events => {
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
      };
      let eventGroupBooked = {
        date: compareDateBooked,
        events: []
      };
      let eventGroupAttended = {
        date: compareDateAttended,
        events: []
      };
      events.forEach(event => {
        if (!event.isBooked) {
          // group event for 'browse' type
          [this.eventsCategorised.browse, eventGroupBrowse, compareDateBrowse] = this._groupEvents(event, this.eventsCategorised.browse, eventGroupBrowse, compareDateBrowse, true);
        } else if (this.utils.timeComparer(event.startTime) >= 0) {
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
      // if activity id is passed in, filter by that activity
      const activityId = +this.route.snapshot.paramMap.get('activityId');
      if (activityId) {
        this.onSelect([activityId]);
      }
      this.loadingEvents = false;
    });
    this.eventService.getActivities().subscribe(activities => {
      this.activities = activities;
    });
  }

  /**
   * This function is used to put events into the proper group
   *
   * @param {Event} event          The event data
   * @param {Array} events         The events array to push group data to
   * @param {Array} eventGroup     The event group array
   * @param {String} compareDate   The compare date string
   * @param {Boolean} isBrowse     If this is for browse (will group all past events in "Expired")
   */
  private _groupEvents(event, events, eventGroup, compareDate, isBrowse = false) {
    const date = this.utils.utcToLocal(event.startTime, 'date');
    // initialise compareDate & eventGroup
    if (!compareDate) {
      compareDate = date;
      eventGroup = {
        date: compareDate,
        events: []
      };
    }

    /**
     * Frontend Expiry status is recalculated from event.start date
     * (API doesn't return explicit conditions to FE to evaluate booking timeframe)
     * - we are checking against the event start time to check if it is expired
     * - if event started and user haven't booked, it is expired
     * - if event started and user has booked, it is in attended
     * - if event haven't started, it's bookable
     */
    if (isBrowse && this.utils.timeComparer(event.startTime) < 0) {
      // group all past events as one group named "Expired"
      if (compareDate !== 'Expired') {
        compareDate = 'Expired';
        if (!this.utils.isEmpty(eventGroup.events)) {
          events.push(eventGroup);
        }
        eventGroup = {
          date: compareDate,
          events: []
        };
      }
      eventGroup.events.push(event);
    } else if (date === compareDate) {
      // this event belongs to the same group as previous one
      eventGroup.events.push(event);
    } else {
      // create a new group for this date
      if (!this.utils.isEmpty(eventGroup.events)) {
        events.push(eventGroup);
      }
      compareDate = this.utils.utcToLocal(event.startTime, 'date');
      eventGroup = {
        date: compareDate,
        events: [event]
      };
    }
    return [events, eventGroup, compareDate];
  }

  /**
   * This is used to get the proper time information need to be displayed on card
   * @param {Event} event [event data]
   */
  timeDisplayed(event) {
    // display date only if it is a past event and is not booked
    if (this.utils.timeComparer(event.startTime) < 0 && !event.isBooked) {
      return this.utils.utcToLocal(event.startTime, 'date');
    }
    // otherwise display time only
    return this.utils.utcToLocal(event.startTime, 'time') + ' - ' + this.utils.utcToLocal(event.endTime, 'time');
  }

  back() {
    return this.ngZone.run(() => this.router.navigate(['app', 'home']));
  }

  showBrowse() {
    this.newRelic.addPageAction('show browse');
    this.activated = 'browse';
    this._filterByActivities();
  }
  showBooked() {
    this.newRelic.addPageAction('show booked');
    this.activated = 'booked';
    this._filterByActivities();
  }
  showAttended() {
    this.newRelic.addPageAction('show attended');
    this.activated = 'attended';
    this._filterByActivities();
  }

  onSelect(value) {
    this.selectedActivities = value;
    this._filterByActivities();
  }

  private _filterByActivities() {
    // initialise events
    this.events = this.eventsCategorised[this.activated];
    if (this.utils.isEmpty(this.selectedActivities)) {
      return ;
    }
    const events = [];
    this.events.forEach(eventGroup => {
      const group: EventGroup = {
        date: eventGroup.date,
        events: []
      };
      eventGroup.events.forEach(event => {
        if (this.selectedActivities.includes(event.activityId)) {
          group.events.push(event);
        }
      });
      if (!this.utils.isEmpty(group.events)) {
        events.push(group);
      }
    });
    this.events = events;
  }
}
