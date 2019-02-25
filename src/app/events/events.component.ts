import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventsService, Event } from './events.service';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';

@Component({
  selector: 'app-events',
  templateUrl: 'events.component.html',
  styleUrls: ['events.component.scss']
})
export class EventsComponent extends RouterEnter {
  routeUrl: string = '/events';
  events: Array<Event>;
  loadingEvents: boolean = true;
  activated: string = 'browse';

  constructor (
    public router: Router,
    private eventService: EventsService,
    public utils: UtilsService
  ) {
    super(router);
  }

  onEnter() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
      this.loadingEvents = false;
    })
  }

  back() {
    this.router.navigate(['app', 'home']);
  }

  showBrowse() {
    this.activated = 'browse';
  }
  showBooked() {
    this.activated = 'booked';
  }
  showAttended() {
    this.activated = 'attended';
  }
}
