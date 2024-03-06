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
      data.apikey = this.storageService.getUser().apikey || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNDA0MiwidXNlcm5hbWUiOiJsZWFybmVyXzAwOEBwcmFjdGVyYS5jb20iLCJ0aW1lbGluZV9pZCI6MjMzOSwicHJvZ3JhbV9pZCI6MjAzNCwiZXhwZXJpZW5jZV9pZCI6MTY3NywiaW5zdGl0dXRpb25faWQiOjUyLCJwcm9qZWN0X2lkIjoyMzk3LCJyb2xlIjoicGFydGljaXBhbnQiLCJpc3MiOiJodHRwczovL2FwaS5wcmFjdGVyYS5jb20iLCJpYXQiOjE2OTUzNzIzMDkxNjAsImV4cCI6MTY5NTM3MjM5NTU2MH0.GZqmW0LxX2AdV_SQb82y1-evsbJWLNpq-M6JMFS9B2axmLnWYo2cKUDadZQsA9NS1zx6us8r_mlXnwyWZEe4uemeKIldYDh5kuJcMaCjxGdfzXgRxTLZHvCDrP6VOBX1OcBzfb3RO0Whq_OMUQgVhokIgUKEhSirQajkztmQGohSycsu4DV6_MK3jyVqjzP1OggRPkpSddgpWgFFgM2effSoQZ_YdLXq1pfNeDakR2Xmo9nN69AwiJ744bG-lygNbhj6hOHmBsfPJbVfzKwnvdelt2k9u3rkjd-GzQn26xT15RXVpBEm8EILDDcB_ZNFpJQA9Di89JIh97f-pk6x_7mwU3ouI_Qi5rWLsXJwpPQ2XDjcb5cgLzCgd60QKaAzQtzcLFAhHlSmbwdeEj5QYIxcGOemr7QLw6Ermp7otwfNfLu-oZRfutuRkQucOD1qracoz_uZo9sOwyil9HTwn3Z_x8myFiI0l3lSDuNtcTVgHs4__LhTJWoaTUTkEZr8IGoio9KmF1CcLkVpV-cf2kMCsMy76Txe7zQx1f403g5cX4wll3bjU5Sr00pqZX5PUIK4QQr5uzaHYl4wj7l9Q6VqKUix9pQvH7d54dykML-ZiL6SKDTPCKM1YNWf7RH76_eAahOf0Pcdw1jmUhPMkp3oc3NRywrJN5uKSYXL_j8';
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

    // mark todo with status (repeatable)
    this.notificationsService.markTodoItemAsDone({identifier: 'Achievement-'+13919}).subscribe(res => {
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

  // called to update unlocked tasks
  getTodoList() {
    this.notificationsService.getTodoItems().subscribe(res => {
      console.log('todoiteams', res);
    });
  }

  markAllUnlockTaskDone() {
    this.unlockIndicatorService.allUnlockedTasks().forEach(task => {
      this.notificationsService.markTodoItemAsDone(task).subscribe(res => {
        console.log('res', res);
      });
      this.unlockIndicatorService.removeTask(task.taskId);
    });
  }
}
