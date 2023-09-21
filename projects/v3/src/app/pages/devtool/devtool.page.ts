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
    this.authService.authenticate({
      email: 'learner_008@practera.com',
      password: 'kW96dLJHrQDaaLM'
    }).subscribe(res => {
      console.log(res);
    });
  }
}
