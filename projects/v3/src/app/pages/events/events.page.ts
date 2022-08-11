import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';
import { Event } from '@v3/services/event.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {

  // used in RouteEnter to trigger onEnter() of this component
  routeUrl = '/app/events';
  // activity id from the route
  activityId: number;
  // Event id. Used to highlight the event in the list
  eventId: number;
  // multi day id. Used to highlight the event in the list if event is multiday event
  multiDayId: string;
  // The object of current event. Used to display the event detail
  currentEvent: Event;
  // check-in assessment id. If null, don't display assessment component
  assessmentId: number;
  // check-in assessment context id.
  contextId: number;
  // event list component
  @ViewChild('eventList') eventList;
  // event detail component
  @ViewChild('eventDetail') eventDetail: ElementRef;
  // assessment component
  @ViewChild('assessment') assessment;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private route: ActivatedRoute,
    public utils: UtilsService,
  ) { }

  ngOnInit() {
    // get activity and event id from route
    this.activityId = +this.route.snapshot.paramMap.get('activity_id');
    this.eventId = +this.route.snapshot.paramMap.get('event_id');
    // don't display assessment component by default
    this.assessmentId = null;
    this.currentEvent = null;
    // trigger eventList onEnter() after the element gets generated
    setTimeout(() => {
      this.eventList.onEnter();
    });
  }

  // display the event content in the right pane, and highlight it on the left pane
  goto(event) {
    this.currentEvent = event;
    this.eventId = event ? event.id : 0;
    this.multiDayId = event && event.isMultiDay ? event.multiDayInfo.id : 0;
    // not displaying the check-in assessment
    this.assessmentId = null;
    this.contextId = null;

    const eventDetailElement = this.document.getElementById('eventDetail');
    if (eventDetailElement) {
      eventDetailElement.focus();
    }
  }

  checkin(params: { assessmentId: number; contextId: number }) {
    if (!params.assessmentId || !params.contextId) {
      return;
    }
    this.assessmentId = params.assessmentId;
    this.contextId = params.contextId;
    // trigger assessment onEnter() after the element gets generated
    setTimeout(() => {
      this.assessment.onEnter();
    });
  }

}
