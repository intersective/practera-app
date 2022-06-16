import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SettingsPage } from '@v3/app/pages/settings/settings.page';
import { AnimationsService } from '@v3/services/animations.service';
import { Subscription } from 'rxjs';
import { NotificationsPage } from '../pages/notifications/notifications.page';
import { BrowserStorageService, User } from '../services/storage.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-personalised-header',
  templateUrl: './personalised-header.component.html',
  styleUrls: ['./personalised-header.component.scss'],
})
export class PersonalisedHeaderComponent implements OnDestroy {
  subscriptions: Subscription[] = [];

  constructor(
    private modalController: ModalController,
    private readonly animationService: AnimationsService,
    private readonly storageService: BrowserStorageService,
    private readonly utilService: UtilsService,
    private router: Router,
    private utils: UtilsService,
  ) {
    this.subscriptions.push(this.utils.getEvent('notification').subscribe(event => {
      console.log('notification::', event);
    }));
  }

  get isMobile(): boolean {
    return this.utilService.isMobile();
  }

  get user(): User {
    return this.storageService.getUser();
  }

  ngOnDestroy(): void {
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(subs => subs.unsubscribe());
    }
  }

  async notifications(): Promise<void | boolean> {
    if (this.isMobile) {
      return this.router.navigate(['v3', 'notifications']);
    }

    const modal = await this.modalController.create({
      component: NotificationsPage,
      componentProps: {
        mode: 'modal',
      },
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
      cssClass: 'right-affixed',
    });
    return modal.present();
  }

  async settings(): Promise<void | boolean> {
    if (this.isMobile) {
      return this.router.navigate(['v3', 'settings']);
    }

    const modal = await this.modalController.create({
      component: SettingsPage,
      componentProps: {
        mode: 'modal',
      },
      enterAnimation: this.animationService.enterAnimation,
      leaveAnimation: this.animationService.leaveAnimation,
      cssClass: 'right-affixed',
    });

    return modal.present();
  }
}
