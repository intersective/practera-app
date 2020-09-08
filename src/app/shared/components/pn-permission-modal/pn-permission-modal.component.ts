import { Component, Input } from '@angular/core';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'pn-permission-modal',
  templateUrl: './pn-permission-modal.component.html',
  styleUrls: ['./pn-permission-modal.component.scss']
})
export class PNPermissionModalComponent {
  constructor(
    public modalController: ModalController,
    public utils: UtilsService
  ) {}

  confirmed() {
    this.modalController.dismiss();
  }
}
