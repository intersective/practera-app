/* eslint-disable no-console */
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@v3/app/services/auth.service';
import { ExperienceService } from '@v3/app/services/experience.service';
import { FastFeedbackService } from '@v3/app/services/fast-feedback.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { SharedService } from '@v3/app/services/shared.service';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';

@Component({
  selector: 'app-devtool',
  templateUrl: './devtool.page.html',
  styleUrls: ['./devtool.page.scss'],
})
export class DevtoolPage implements OnInit {
  doneLogin: boolean = false;
  user: any = {};
  themeToggle = false;0

  sample: any;

  constructor(
    private authService: AuthService,
    private storageService: BrowserStorageService,
    private fastFeedbackService: FastFeedbackService,
    private notificationsService: NotificationsService,
    private experienceService: ExperienceService,
    private sharedService: SharedService,
    private unlockIndicatorService: UnlockIndicatorService
      ) { }

  ngOnInit() {
    this.doneLogin = this.authService.isAuthenticated();
    if (this.doneLogin) {
      this.user = this.storageService.get('me');
    }
    // Use matchMedia to check the user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Initialize the dark theme based on the initial
    // value of the prefers-color-scheme media query
    this.initializeDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => this.initializeDarkTheme(mediaQuery.matches));

  }

  refresh() {
    this.sharedService.getNewJwt().subscribe();
  }

  async pulsecheck() {
    this.storageService.set('fastFeedbackOpening', false);
    const modal = await this.fastFeedbackService.pullFastFeedback({ modalOnly: true }).toPromise();
    if (modal && modal.present) {
      await modal.present();
      await modal.onDidDismiss();
    }
  }

  async showErrorAlert() {
    try {
      throw new Error('Missing parameters');
    } catch (err) {
      await this.notificationsService.alert({
        header: $localize`Error submitting rating`,
        message: err.message ? $localize`Apologies for the inconvenience caused. Something went wrong. Error: ${err.message}` : JSON.stringify(err),
      });
      throw new Error(err);
    }
  }

  async showAlert() {
    this.notificationsService.alert({
      header: 'header',
      subHeader: 'subheader',
      message: 'body message',
      buttons: [
        'ok',
        'close',
        {
          text: 'dismiss with a message',
          handler: () => {
            this.notificationsService.alert({
              message: 'a message',
            });
          },
        },
        {
          text: 'open another alert',
          handler: () => {
            this.notificationsService.alert({
              header: 'another header',
              subHeader: 'another subheader',
              message: 'another body message with no button',
            });
          }
        }
      ]
    });
  }

  async reviewrating() {
    this.notificationsService.popUpReviewRating(1, false);
  }

  async testAuth(withAPIkey?: boolean) {
    const data: any = {};
    if (withAPIkey === true) {
      data.apikey = this.storageService.getUser().apikey || 'REDACTED_JWT_TOKEN';
    } else {
      // data.authToken = '$2a$10$1UO3e6b8NdzCX';
      data.authToken = '$2a$10$A8Bu9a7KJogPD';
      // data.authToken = '$2a$10$NggHX.VgJhIWi';
    }

    this.authService.authenticate({...data, ...{service: 'LOGIN'}}).subscribe(res => {
      console.log(res);
    });
  }

  // Check/uncheck the toggle and update the theme based on isDark
  initializeDarkTheme(isDark) {
    this.themeToggle = isDark;
    this.toggleDarkTheme(isDark);
  }

  // Listen for the toggle check/uncheck to toggle the dark theme
  toggleChange(ev) {
    this.toggleDarkTheme(ev.detail.checked);
  }

  // Add or remove the "dark" class on the document body
  toggleDarkTheme(shouldAdd) {
    document.body.classList.toggle('dark', shouldAdd);
  }

  newItems: { id: number; model: string; model_id: number; type: string; }[] = [];
  async triggerAchievement(identifier?: string) {
    if (identifier) {
      this.notificationsService.markTodoItemAsDone(identifier).subscribe(res => {
        console.log('manual-marked::', res);
      })
      return;
    }

    this.notificationsService.markTodoItemAsDone('Achievement-'+13919).subscribe(res => {
      this.newItems = res?.data?.meta?.new_items;
      console.log(this.newItems);
      const uniqueEntries = this.unlockIndicatorService.transformAndDeduplicate(this.newItems);
      this.sample = uniqueEntries;
      /*
        .forEach(item => {
          this.unlockIndicatorService.unlockTask(item.milestoneId, item.activityId, item.taskId);
        }); */
        console.log(uniqueEntries);

      console.log('unlockedTasks::', this.storageService.get('unlockedTasks'));
      // this.unlockIndicatorService.unlockTask();
    });
  }

  getTodoList() {
    this.notificationsService.getTodoItems().subscribe(res => {
      console.log('todoiteams', res);
    });
  }
}
