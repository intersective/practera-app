import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SettingsPage } from '@v3/app/pages/settings/settings.page';
import { AnimationsService } from '@v3/services/animations.service';
import { Subscription } from 'rxjs';
import { NotificationsPage } from '../pages/notifications/notifications.page';
import { NotificationsService } from '../services/notifications.service';
import { BrowserStorageService, User } from '../services/storage.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-personalised-header',
  templateUrl: './personalised-header.component.html',
  styleUrls: ['./personalised-header.component.scss'],
})
export class PersonalisedHeaderComponent implements OnInit {
  subscriptions: Subscription[] = [];
  notiCount: number = 0;

  constructor(
    private modalController: ModalController,
    private readonly animationService: AnimationsService,
    private readonly storageService: BrowserStorageService,
    private readonly utilService: UtilsService,
    private readonly router: Router,
    private readonly notificationsService: NotificationsService,
  ) {
  }

  ngOnInit() {
    this.subscriptions.push(this.notificationsService.notification$.subscribe(notifications => {
      const notiCount = notifications.length;
      this.notiCount = notiCount < 100 ? notiCount : 99; // max show 99 only
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      if (sub.closed !== true) {
        sub.unsubscribe();
      }
    });
  }

  get isMobile(): boolean {
    return this.utilService.isMobile();
  }

  get user(): User {
    return this.storageService.getUser();
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
