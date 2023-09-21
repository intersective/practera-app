import { Component, OnInit } from '@angular/core';
import { AuthService } from '@v3/app/services/auth.service';
import { ExperienceService } from '@v3/app/services/experience.service';
import { FastFeedbackService } from '@v3/app/services/fast-feedback.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';

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
  ) { }

  ngOnInit() {
    this.doneLogin = this.authService.isAuthenticated();
    if (this.doneLogin) {
      this.user = this.storageService.get('me');
    }
  }

  refresh() {
    this.experienceService.getNewJwt().subscribe();
  }

  login() {
    this.authService.login({
      email: 'learner_008@practera.com',
      password: 'kW96dLJHrQDaaLM'
    }).subscribe(res => {
      this.doneLogin = true;
      this.user = res;
      this.experienceService.getMyInfo();
    });
  }

  async pulsecheck() {
    this.storageService.set('fastFeedbackOpening', false);
    const modal = await this.fastFeedbackService.pullFastFeedback({ modalOnly: true }).toPromise();
    if (modal && modal.present) {
      await modal.present();
      await modal.onDidDismiss();
    }
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
