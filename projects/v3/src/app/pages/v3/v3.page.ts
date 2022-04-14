import { Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { AnimationsService } from '@v3/services/animations.service';
import { SettingsPage } from '../settings/settings.page';
import { SharedService } from '@v3/services/shared.service';

@Component({
  selector: 'app-v3',
  templateUrl: './v3.page.html',
  styleUrls: ['./v3.page.scss'],
})
export class V3Page {
  appPages = [
    {
      title: 'Home',
      url: '/v3/home',
      icon: 'home'
    },
    {
      title: 'Events',
      url: '/v3/events',
      icon: 'calendar'
    },
    {
      title: 'Reviews',
      url: '/v3/review-desktop',
      icon: 'eye'
    },
    {
      title: 'Messages',
      url: '/v3/messages',
      icon: 'mail'
    }
  ];
  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private animationService: AnimationsService,
    private sharedService: SharedService
  ) {
    // TODO need to move to experience page to call before navigate to experience
    this.sharedService.initWebServices();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: SettingsPage,
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
      cssClass: 'right-affixed'
    });
    return await modal.present();
  }

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: SettingsPage,
      size: 'cover',
      side: 'right',
      alignment: 'end',
    });
    return await popover.present();
  }
}
