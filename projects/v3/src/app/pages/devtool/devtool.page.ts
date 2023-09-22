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
    const key = '$2a$10$1UO3e6b8NdzCX';
    // const key = '$2a$10$NggHX.VgJhIWi';
    // const key = this.storageService.getUser().apikey;
    // const key = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwOi8vYXBpLnByYWN0ZXJhLmNvbSIsImFwaWtleSI6Ijc0MjAyN2ViNWM2YmYyZWYxZDljIiwidXNlcl9pZCI6MTQwNDIsInVzZXJfdXVpZCI6IjA0OGYzMzZjLWMxMjEtNDBmOS1hNzE5LTBmYzgwNjJjM2ZlZiIsInVzZXJuYW1lIjoibGVhcm5lcl8wMDhAcHJhY3RlcmEuY29tIiwiaWF0IjoxNjk1MDEzOTM5LCJleHAiOjE3MDI3ODk5MzksInRpbWVsaW5lX2lkIjoxNjcxLCJ0aW1lbGluZV91dWlkIjoiYTI3YjIzOWYtOGVkNC00NGQ3LWEyNDYtYWZlMWUzMWYyMDYxIiwiaW5zdGl0dXRpb25fdXVpZCI6ImQyZTk1NDNkLTk2MWItNDE3Yi05Y2ExLWNhOGY4MjcxOWE1NiIsImluc3RpdHV0aW9uX2lkIjo1MiwiZXhwZXJpZW5jZV9pZCI6OTgxLCJwcm9ncmFtX2lkIjoxMzM4LCJwcm9qZWN0X2lkIjoxNzAxLCJyb2xlIjoicGFydGljaXBhbnQiLCJlbnJvbG1lbnRfdXVpZCI6IjQ2ZGZiYmUzLWJiNWEtNGRmNy1iNWU4LTkyYjJmZGU4OThmYiJ9.SLvnftTOO_kydbYndM1wwC3vd8wwkdniWAIoF6lPWk0QYeiiabdPrO9cDdeR4xdF1yl1XiFOz3qVPP_SaPkXBukx-6VA-PUsV6vwFhIsyTwXSE9295tZbtPxJjI1FdQdj7kNt_zeODiMezmcJftf83w4XqoLMAVcXdc9y-LD-FgStNvoot-K3zUH_I1CMIMjGSzet0Yrd8TADzkPUSiPm98-MTFxohKuWUclpKxgzpHHYPxjBsyWgL702BwoHXkI5pPOtaxAE7Z2lp_LlRbW9uCyXgSFrojQtWGfd6oL3tjxSpwjyoLPCzPWnUMhYO-ad5PSv_8Y7nRJh4-yRVM5QoRAWbbVbOTJ6IUS-pRcR9bOdEuQ9jgcoGC-tg-X_hsjeFj91dNSqBYNF4ELRQhapzJwomWt7GzJThORaAsmnoIBAOaFaudWdk3KgrOhlGJ5_jLjcwmllSJ1Qk0Kwc0LWKjAys8XU_IeT_wiQRNbFYAoSNVQOIL6xH-5i52_8Rc2CAyhTBwAFKRQm1WSxDOVkq1ufpNeu4T6Y4ywMO2ZM-lwuRispkrPcpM1UJaHOlSKSRR8-NWL7yHvhgTq_PWqXi6dOmIIuuKoM-MxPpPhbk8QzQR7jihJ2WB6D3tOsZb7wsMgQM11z04gzkHUDq0bYIEvTa8CiL20WEVBg6MIgzA`
    this.authService.authenticate(key).subscribe(res => {
      console.log(res);
    });
  }
}
