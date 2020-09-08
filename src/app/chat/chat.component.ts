import { Component } from '@angular/core';
import { PushNotificationService } from '@services/push-notification.service';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  template: '<ion-router-outlet></ion-router-outlet>',
})
export class ChatComponent {
  constructor(
    private pushNotificationService: PushNotificationService,
    private notificationService: NotificationService
  ) {}

  async ionViewDidEnter() {
    const hasPNPermission = await this.pushNotificationService.checkPermission('isFirstVisit', '/app/chat');
    if (!hasPNPermission) {
      this.notificationService.popUp('shortMessage', {message: 'To do this assessment, you have to be in a team.'});
    }
  }
}
