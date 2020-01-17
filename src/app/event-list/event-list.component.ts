import { Component, Input, NgZone, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventListService, Event, EventGroup, Activity } from './event-list.service';
import { UtilsService } from '@services/utils.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-event-list',
  templateUrl: 'event-list.component.html',
  styleUrls: ['event-list.component.scss']
})

export class EventListComponent {
  @Output() navigate = new EventEmitter();
  // activity id that is filtered by default
  @Input() activityId;
  // if eventId has value, hightlight this event
  @Input() eventId;
  // the current active tab
  activated = 'browse';
  events: Array<EventGroup> = [];
  eventsCategorised: {
    browse: Array<EventGroup>;
    booked: Array<EventGroup>;
    attended: Array<EventGroup>;
  };
  activities: Array<Activity>;
  // events will be filtered by these activities
  selectedActivities: Array<number>;
  loadingEvents = true;
  goToFirstEvent = true;

  constructor (
    public router: Router,
    private route: ActivatedRoute,
    private eventService: EventListService,
    public utils: UtilsService,
    private ngZone: NgZone,
    private newRelic: NewRelicService
  ) {
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
          // if eventId is passed in, go to the tab that contains this event and highlight it
          if (this.eventId === event.id) {
            this.activated = 'browse';
            this.goto(event);
          }
        } else if (this.utils.timeComparer(event.startTime) >= 0) {
          // group event for 'booked' type
          [this.eventsCategorised.booked, eventGroupBooked, compareDateBooked] = this._groupEvents(event, this.eventsCategorised.booked, eventGroupBooked, compareDateBooked);
          // if eventId is passed in, go to the tab that contains this event and highlight it
          if (this.eventId === event.id) {
            this.activated = 'booked';
            this.goto(event);
          }
        } else {
          // group event for 'attended' type
          [this.eventsCategorised.attended, eventGroupAttended, compareDateAttended] = this._groupEvents(event, this.eventsCategorised.attended, eventGroupAttended, compareDateAttended);
          // if eventId is passed in, go to the tab that contains this event and highlight it
          if (this.eventId === event.id) {
            this.activated = 'attended';
            this.goto(event);
          }
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
      let activityId = this.activityId;
      if (!activityId) {
        activityId = +this.route.snapshot.paramMap.get('activity_id');
      }
      // don't need to go to first event if event id passed in
      if (this.eventId) {
        this.goToFirstEvent = false;
      }
      if (activityId) {
        this.onSelect([activityId]);
      } else {
        this._rearrangeEvents();
      }
      this.loadingEvents = false;
    });
    this.eventService.getActivities().subscribe(activities => {
      this.activities = activities;
    });
  }

  // tell parent component that user is going to an event
  goto(event) {
    // only goto an event for desktop view
    if (this.utils.isMobile()) {
      return ;
    }
    this.navigate.emit(event);
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

  showBrowse() {
    this.newRelic.addPageAction('show browse');
    this.activated = 'browse';
    this.goToFirstEvent = true;
    this._rearrangeEvents();
  }
  showBooked() {
    this.newRelic.addPageAction('show booked');
    this.activated = 'booked';
    this.goToFirstEvent = true;
    this._rearrangeEvents();
  }
  showAttended() {
    this.newRelic.addPageAction('show attended');
    this.activated = 'attended';
    this.goToFirstEvent = true;
    this._rearrangeEvents();
  }

  onSelect(value) {
    this.selectedActivities = value;
    this._rearrangeEvents();
  }

  /**
   * Rearrange current events.
   * Including:
   * 1. filter the events by selected activities
   * 2. go to the first event after filter
   */
  private _rearrangeEvents() {
    this._filterByActivities();
    // don't need to go to first event if it is the inital loading and event id is passed in
    if (!this.goToFirstEvent) {
      return ;
    }
    // Go to the first event.
    // Highlight the event in event list and display the content in event detail
    if (this.events.length) {
      this.goto(this.events[0].events[0]);
    } else {
      this.goto(null);
    }
  }

  /**
   * Filter the current events with selected activities
   */
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
