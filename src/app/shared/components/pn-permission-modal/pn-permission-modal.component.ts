import { Component, Input } from '@angular/core';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';
import { ModalController } from '@ionic/angular';
import { PushNotificationService } from '@services/push-notification.service';

@Component({
  selector: 'pn-permission-modal',
  templateUrl: './pn-permission-modal.component.html',
  styleUrls: ['./pn-permission-modal.component.scss']
})
export class PNPermissionModalComponent {
  constructor(
    public modalController: ModalController,
    public utils: UtilsService,
    private pushNotificationService: PushNotificationService
  ) {}

  dismiss() {
    this.modalController.dismiss();
  }

  // go to Native App settings, so user can manually allow Push Notification there
  goToSetting() {
    return this.pushNotificationService.goToAppSetting();
  }
}
