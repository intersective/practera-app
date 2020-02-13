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
  remainingEvents: Array<EventGroup> = [];
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
    public eventListService: EventListService,
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
    this.remainingEvents = [];
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
    this.eventListService.getEvents().subscribe(events => {
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
      const activityIdsWithEvent = [];
      events.forEach(event => {
        // record the id of activity that has event, so that we can filter the activity list later
        if (!activityIdsWithEvent.includes(event.activityId)) {
          activityIdsWithEvent.push(event.activityId);
        }
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
      this.renderEvents(this.eventsCategorised[this.activated]);
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
      // get activity list
      this.eventListService.getActivities().subscribe(activities => {
        // only display activity that has event
        this.activities = activities.filter(activity => activityIdsWithEvent.includes(activity.id));
      });
    });
  }

  // render more events from remainingEvents
  loadMoreEvents(event) {
    setTimeout(
      () => {
        this.renderEvents();
        event.target.complete();
      },
      500
    );
  }

  /**
   * Render 7 events at one time.
   * If one event group doesn't have 7 events, will render the next event group until 7 events or all rendered
   *
   * @param remainingEvents Pass the remaining event groups if we need to reset the event list
   */
  renderEvents(remainingEvents?) {
    if (!this.events) {
      this.events = [];
    }
    // re-assign remainingEvents if passed in
    if (remainingEvents) {
      this.remainingEvents = JSON.parse(JSON.stringify(remainingEvents));
      this.events = [];
    }
    // don't need to do anything if no remaining events
    if (!this.remainingEvents) {
      return ;
    }
    let eventsCount = 0, eventGroup;
    const maxEvents = 7;
    while (eventsCount < maxEvents) {
      // stop if there's no remaining events
      if (!this.remainingEvents.length) {
        break;
      }
      eventGroup = this.remainingEvents[0];
      if (eventsCount + eventGroup.events.length <= maxEvents) {
        // render the whole event group if no more than max events yet
        this.remainingEvents.shift();
        eventsCount += eventGroup.events.length;
      } else {
        eventGroup = {
          date: this.remainingEvents[0].date,
          events: this.remainingEvents[0].events.splice(0, maxEvents - eventsCount)
        };
        eventsCount = maxEvents;
      }

      if (this.events.length && this.events[this.events.length - 1].date === eventGroup.date) {
        // concat the new event group to the last one
        this.events[this.events.length - 1].events = this.events[this.events.length - 1].events.concat(eventGroup.events);
      } else {
        // push the new event group
        this.events.push(eventGroup);
      }
    }
  }

  // tell parent component that user is going to an event
  goto(event) {
    // pop up event detail for mobile
    if (this.utils.isMobile()) {
      return this.eventListService.eventDetailPopUp(event);
    }
    // goto an event for desktop view
    return this.navigate.emit(event);
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
    // don't need to go to first event if it is the inital loading and event id is passed in or it is on mobile mode
    if (!this.goToFirstEvent || this.utils.isMobile()) {
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
    // no need to filter any activity if not selected
    if (this.utils.isEmpty(this.selectedActivities)) {
      this.renderEvents(this.eventsCategorised[this.activated]);
      return ;
    }
    const events = [];
    this.eventsCategorised[this.activated].forEach(eventGroup => {
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
    this.renderEvents(events);
  }
}
