import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PushNotificationService, PermissionTypes } from '@services/push-notification.service';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  template: '<ion-router-outlet></ion-router-outlet>',
})
export class ChatComponent {
  constructor(
    private pushNotificationService: PushNotificationService,
    private notificationService: NotificationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    activatedRoute.data.subscribe(() => {
      this.checkPNPermission(this.router.routerState.snapshot);
    });
  }

  async checkPNPermission(snapshot) {
    const promptForPermission = await this.pushNotificationService.promptForPermission(PermissionTypes.firstVisit, snapshot);
    if (promptForPermission) {
      this.notificationService.popUp('shortMessage', {
        message: 'To do this assessment, you have to be in a team.'
      });
    }
  }
}
