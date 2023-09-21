import { Component, OnInit } from '@angular/core';
import { AuthService } from '@v3/app/services/auth.service';
import { ExperienceService } from '@v3/app/services/experience.service';
import { FastFeedbackService } from '@v3/app/services/fast-feedback.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { SharedService } from '@v3/app/services/shared.service';

@Component({
  selector: 'app-devtool',
  templateUrl: './devtool.page.html',
  styleUrls: ['./devtool.page.scss'],
})
export class DevtoolPage implements OnInit {
  doneLogin: boolean = false;
  user: any = {};

  constructor(
    private authService: AuthService,
    private storageService: BrowserStorageService,
    private fastFeedbackService: FastFeedbackService,
    private notificationsService: NotificationsService,
    private experienceService: ExperienceService,
    private sharedService: SharedService,
  ) { }

  ngOnInit() {
    this.doneLogin = this.authService.isAuthenticated();
    if (this.doneLogin) {
      this.user = this.storageService.get('me');
    }
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

  async testAuth() {
    this.authService.authenticate('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxlYXJuZXJfMDA4QHByYWN0ZXJhLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNjk1MTg3OTQ2ODc1LCJpYXQiOjE2OTUxODc4NjB9.pPFxN4O2nFWspYNEP88raLJzEK2M1Xe0ZxmCib9YKA4qtDkAj1Tt0LFYZ3mo-eVijkD6kDd6Y_RBzn07wNoh532ja8cRlcYRORXkuvPH9wJ43mWfFL-NO8sLnFbJVc6-GQYvoMBqKqwLbM5R2dSGhf-3Pb1P5353Dvp3KMtLRN7TGxmQjFntY0qxnMpEnF8L4pcJ-NM-q2zjRe9IRXmjwoZI9Arc8T4xBy98XPgbbiRR8MVpr-Do6yOU7r5AHsK-GzCUU9W5pMWbFc0LSmHkN0XHq53JhCGBEX_RLcruSec0rOO0AQgrg1GFbknQciH2owtyXvSy8dHKUvzYHHhJlA;apikey=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxlYXJuZXJfMDA4QHByYWN0ZXJhLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNjk1MTg3OTQ2ODc1LCJpYXQiOjE2OTUxODc4NjB9.pPFxN4O2nFWspYNEP88raLJzEK2M1Xe0ZxmCib9YKA4qtDkAj1Tt0LFYZ3mo-eVijkD6kDd6Y_RBzn07wNoh532ja8cRlcYRORXkuvPH9wJ43mWfFL-NO8sLnFbJVc6-GQYvoMBqKqwLbM5R2dSGhf-3Pb1P5353Dvp3KMtLRN7TGxmQjFntY0qxnMpEnF8L4pcJ-NM-q2zjRe9IRXmjwoZI9Arc8T4xBy98XPgbbiRR8MVpr-Do6yOU7r5AHsK-GzCUU9W5pMWbFc0LSmHkN0XHq53JhCGBEX_RLcruSec0rOO0AQgrg1GFbknQciH2owtyXvSy8dHKUvzYHHhJlA').subscribe(res => {
      console.log(res);
    });
  }
}
