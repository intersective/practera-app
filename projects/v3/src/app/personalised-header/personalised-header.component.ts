import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SettingsPage } from '@v3/app/pages/settings/settings.page';
import { AnimationsService } from '@v3/services/animations.service';
import { NotificationsPage } from '../pages/notifications/notifications.page';

@Component({
  selector: 'app-personalised-header',
  templateUrl: './personalised-header.component.html',
  styleUrls: ['./personalised-header.component.scss'],
})
export class PersonalisedHeaderComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private readonly animationService: AnimationsService
  ) { }

  ngOnInit() {
  }

  async notifications(): Promise<void> {
    const modal = await this.modalController.create({
      component: NotificationsPage,
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
      cssClass: 'right-affixed',
    });
    return modal.present();
  }

  async settings(): Promise<void> {
    const modal = await this.modalController.create({
      component: SettingsPage,
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
      cssClass: 'right-affixed',
    });
    return modal.present();
  }
}
