import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';
import { UtilsService } from '@v3/services/utils.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-badge-detail-modal',
  templateUrl: 'badge-detail-modal.component.html',
  styleUrls: ['badge-detail-modal.component.scss'],
})
export class BadgeDetailModalComponent implements OnInit {
  @Input() achievement: Achievement;

  certificateLoading = false;
  openBadgeLoading = false;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private achievementService: AchievementService,
    private utils: UtilsService,
    private http: HttpClient,
  ) {}

  ngOnInit() {}

  get isMobile() {
    return this.utils.isMobile();
  }

  get hasCertificate(): boolean {
    return typeof this.achievement?.certificateUrl === 'string' &&
      this.achievement.certificateUrl.startsWith('https://');
  }

  get hasOpenBadge(): boolean {
    return typeof this.achievement?.openBadge === 'string' &&
      this.achievement.openBadge.startsWith('https://');
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async downloadCertificate(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') {
      return;
    }
    const alert = await this.alertController.create({
      header: $localize`Download Certificate`,
      message: $localize`Would you like to customise the name shown on your certificate?`,
      buttons: [
        {
          text: $localize`No, download now`,
          handler: () => {
            window.open(this.achievement.certificateUrl, '_system');
          },
        },
        {
          text: $localize`Yes, change name`,
          handler: () => {
            this._downloadCertificateWithName();
          },
        },
      ],
    });
    await alert.present();
  }

  private async _downloadCertificateWithName() {
    const nameAlert = await this.alertController.create({
      header: $localize`Name on Certificate`,
      inputs: [
        {
          name: 'userName',
          type: 'text',
          placeholder: $localize`Enter your name`,
        },
      ],
      buttons: [
        {
          text: $localize`Cancel`,
          role: 'cancel',
        },
        {
          text: $localize`Download`,
          handler: async (data) => {
            const name = data?.userName?.trim();
            if (!name) {
              window.open(this.achievement.certificateUrl, '_system');
              return;
            }
            const loading = await this.loadingController.create({
              message: $localize`Generating certificate…`,
            });
            await loading.present();
            try {
              const url = await firstValueFrom(
                this.achievementService.getCertificateUrl(this.achievement.id, name)
              );
              if (url) {
                window.open(url, '_system');
              }
            } finally {
              await loading.dismiss();
            }
          },
        },
      ],
    });
    await nameAlert.present();
  }

  async downloadOpenBadge(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') {
      return;
    }
    const alert = await this.alertController.create({
      header: $localize`Download Open Badge`,
      message: $localize`Would you like to change the email address associated with this badge before downloading?`,
      buttons: [
        {
          text: $localize`No, download now`,
          handler: () => {
            this._triggerOpenBadgeDownload(this.achievement.openBadge);
          },
        },
        {
          text: $localize`Yes, change email`,
          handler: () => {
            this._downloadOpenBadgeWithEmail();
          },
        },
      ],
    });
    await alert.present();
  }

  private async _downloadOpenBadgeWithEmail() {
    const emailAlert = await this.alertController.create({
      header: $localize`Badge Email Address`,
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: $localize`Enter email address`,
        },
      ],
      buttons: [
        {
          text: $localize`Cancel`,
          role: 'cancel',
        },
        {
          text: $localize`Download`,
          handler: async (data) => {
            const email = data?.email?.trim();
            if (!email) {
              this._triggerOpenBadgeDownload(this.achievement.openBadge);
              return;
            }
            const loading = await this.loadingController.create({
              message: $localize`Updating badge…`,
            });
            await loading.present();
            try {
              await firstValueFrom(
                this.achievementService.rebadgeOpenBadge(this.achievement.id, email)
              );
              this._triggerOpenBadgeDownload(this.achievement.openBadge);
            } catch {
              // still attempt download even if rebadge fails
              this._triggerOpenBadgeDownload(this.achievement.openBadge);
            } finally {
              await loading.dismiss();
            }
          },
        },
      ],
    });
    await emailAlert.present();
  }

  private _triggerOpenBadgeDownload(url: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `${this.achievement.name ?? 'badge'}.png`;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => {
        // Fall back to window.open if blob download fails (CORS)
        window.open(url, '_blank');
      },
    });
  }
}
