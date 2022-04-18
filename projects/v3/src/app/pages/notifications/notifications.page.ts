import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { UtilsService } from '@v3/app/services/utils.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  loadingTodoItems: boolean;

  constructor(
    private utils: UtilsService,
    private notificationsService: NotificationsService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  showEventDetail(event) {
    if (this.utils.isMobile()) {
      return this.notificationsService.modal(
        {},
        { event },
        { cssClass: 'event-detail-popup' }
      );
    } else {
      // go to the events page with the event selected
      this.router.navigate(['app', 'events', { event_id: event.id }]);
    }
  }
}
