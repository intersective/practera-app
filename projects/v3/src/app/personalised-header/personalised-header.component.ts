import { Component, OnDestroy, OnInit, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular/lazy';
import { SettingsPage } from '@v3/app/pages/settings/settings.page';
import { AnimationsService } from '@v3/services/animations.service';
import { Subscription } from 'rxjs';
import { NotificationsPage } from '../pages/notifications/notifications.page';
import { NotificationsService } from '../services/notifications.service';
import { BrowserStorageService, User } from '../services/storage.service';
import { UtilsService } from '../services/utils.service';
import { SupportPopupComponent } from '../components/support-popup/support-popup.component';

@Component({
  standalone: false,
  selector: 'app-personalised-header',
  templateUrl: './personalised-header.component.html',
  styleUrls: ['./personalised-header.component.scss'],
})
export class PersonalisedHeaderComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  notiCount: number = 0;
  isShowSupportBtn: boolean = false;
  @Input() isExpPage: boolean = false;

  isLoadingSetting = false;

  constructor(
    private modalController: ModalController,
    private readonly animationService: AnimationsService,
    private readonly storageService: BrowserStorageService,
    private readonly utilService: UtilsService,
    private readonly router: Router,
    private readonly notificationsService: NotificationsService,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.subscriptions.push(this.storageService.userChanges$.subscribe(() => {
      this.ngZone.run(() => this.cdr.markForCheck());
    }));
    this.subscriptions.push(this.notificationsService.notification$.subscribe(notifications => {
      this.ngZone.run(() => {
        const notiCount = notifications.length;
        this.notiCount = notiCount < 100 ? notiCount : 99; // max show 99 only
        this.cdr.markForCheck();
      });
    }));
    this.subscriptions.push(this.utilService.getEvent('support-email-checked').subscribe(event => {
      // hide support button on mobile. because we need space in heder for other things. but we still have the settings page
      this.ngZone.run(() => {
        this.isShowSupportBtn = event;
        this.cdr.markForCheck();
      });
    }));
    this.utilService.checkIsPracteraSupportEmail();
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
    if (this.isLoadingSetting) {
      return;
    }
    this.ngZone.run(() => {
      this.isLoadingSetting = true;
      this.cdr.markForCheck();
    });

    try {
      if (this.isMobile) {
        return await this.router.navigate(['v3', 'settings']);
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
      return await modal.present();
    } finally {
      // Ionic/router promises do not automatically refresh a zoneless Angular view.
      this.ngZone.run(() => {
        this.isLoadingSetting = false;
        this.cdr.markForCheck();
      });
    }
  }

  async openSupport() {
    const modal = await this.modalController.create({
      componentProps: {
        mode: 'modal',
      },
      component: SupportPopupComponent,
      cssClass: 'support-popup',
      backdropDismiss: false,
    });

    return modal.present();
  }
}
