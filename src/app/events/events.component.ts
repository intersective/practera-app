import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';
import { Event } from '@app/event-list/event-list.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent extends RouterEnter {
  // used in RouteEnter to trigger onEnter() of this component
  routeUrl = '/events';
  // activity id from the route
  activityId: number;
  // Event id. Used to highlight the event in the list
  eventId: number;
  // The object of current event. Used to display the event detail
  currentEvent: Event;
  // check-in assessment id. If null, don't display assessment component
  assessmentId: number;
  // check-in assessment context id.
  contextId: number;
  // event list component
  @ViewChild('eventList') eventList;
  // event detail component
  @ViewChild('eventDetail') eventDetail;
  // assessment component
  @ViewChild('assessment') assessment;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public utils: UtilsService
  ) {
    super(router);
  }

  onEnter() {
    // get activity and event id from route
    this.activityId = +this.route.snapshot.paramMap.get('activity_id');
    this.eventId = +this.route.snapshot.paramMap.get('event_id');
    // don't display assessment component by default
    this.assessmentId = null;
    // trigger eventList onEnter() after the element gets generated
    setTimeout(() => {
      this.eventList.onEnter();
    });
  }

  /**
   * Go to the specific event based on parameters
   * Or go to the first event
   */
  goToFirstEvent(events) {
    // only go to the first event if we are not displaying any event yet
    if (this.currentEvent || this.eventId) {
      return ;
    }
    if (events.browse.length) {
      this.currentEvent = events.browse[0].events[0];
    } else if (events.booked.length) {
      this.currentEvent = events.booked[0].events[0];
    } else if (events.attended.length) {
      this.currentEvent = events.attended[0].events[0];
    }
    if (this.currentEvent) {
      this.eventId = this.currentEvent.id;
    }
  }

  // display the event content in the right pane, and highlight it on the left pane
  goto(event) {
    this.currentEvent = event;
    this.eventId = event.id;
  }
}
