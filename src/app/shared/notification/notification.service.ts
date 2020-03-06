import { Injectable } from '@angular/core';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { AlertOptions, ToastOptions, ModalOptions, LoadingOptions } from '@ionic/core';
import { PopUpComponent } from './pop-up/pop-up.component';
import { AchievementPopUpComponent } from './achievement-pop-up/achievement-pop-up.component';
import { LockTeamAssessmentPopUpComponent } from './lock-team-assessment-pop-up/lock-team-assessment-pop-up.component';
import { ActivityCompletePopUpComponent } from './activity-complete-pop-up/activity-complete-pop-up.component';
import { Achievement, AchievementsService } from '@app/achievements/achievements.service';
import { UtilsService } from '@services/utils.service';

export interface CustomTostOptions {
  message: string;
  icon: string;
  duration?: string;
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    public achievementService: AchievementsService,
    public utils: UtilsService,
  ) {}

  dismiss() {
    return this.modalController.dismiss();
  }

  /**
   * @name modalConfig
   * @description futher customised filter
   */
  private modalConfig({ component, componentProps }, options = {}): ModalOptions {
    const config = Object.assign(
      {
        component,
        componentProps,
      },
      options
    );

    return config;
  }

  // show pop up message
  // this is using pop-up.component.ts as the view
  // put redirect = false if don't need to redirect
  async popUp(type, data, redirect: any = false) {
    const component = PopUpComponent;
    const componentProps = {
      type,
      data,
      redirect,
    };
    const modal = await this.modal(component, componentProps);
    return modal;
  }

  async modal(component, componentProps, options?, event?): Promise<void> {
    const modal = await this.modalOnly(component, componentProps, options, event);
    return modal.present();
  }

  async modalOnly(component, componentProps, options?, event?): Promise<HTMLIonModalElement> {
    const modal = await this.modalController.create(this.modalConfig({ component, componentProps }, options));

    if (event) {
      modal.onDidDismiss().then(event);
    }

    return modal;
  }

  async alert(config: AlertOptions) {
    const alert = await this.alertController.create(config);
    return await alert.present();
  }

  // toast message pop up, by default, shown success message for 2 seconds.
  async presentToast(message: string, options?: any) {
    let toastOptions: ToastOptions = {
      message: message,
      duration: 2000,
      position: 'top',
      color : 'danger'
    };
    toastOptions = Object.assign(toastOptions, options);
    const toast = await this.toastController.create(toastOptions);
    return toast.present();
  }

  /**
   * pop up achievement notification and detail
   * sample call for notification popup
   * NotificationService.achievementPopUp('notification', {
   *   image: 'url' (optinal - have default one)
   *   name: "Sample Headding"
   * });
   * sample call for info popup
   * NotificationService.achievementPopUp('', {
   *    image: 'url' (optinal - have default one)
   *    name: "Sample Headding",
   *    points: "100",
   *    description: "qwert yuiop asdfg asdff"
   * });
   */
  async achievementPopUp(type: string, achievement: Achievement) {
    const component = AchievementPopUpComponent;
    const componentProps = {
      type,
      achievement
    };
    if (type === 'notification') {
      this.achievementService.markAchievementAsSeen(achievement.id);
    }
    const modal = await this.modal(component, componentProps, {
      cssClass: this.utils.isMobile() ? 'practera-popup' : 'practera-popup desktop-view',
      keyboardClose: false,
      backdropDismiss: false
    });
    return modal;
  }

  /**
   * pop up to show user click on locked team assessment.
   * @param data
   * sample data object
   * NotificationService.lockTeamAssessmentPopUp({
   *    image: 'url' (optinal - have default one),
   *    name: "Alice"
   * });
   */
  async lockTeamAssessmentPopUp(data, event) {
    const componentProps = {
      name: data.name,
      image: data.image
    };
    const component = LockTeamAssessmentPopUpComponent;
    const modal = await this.modal(
      component, componentProps,
      {
        cssClass: this.utils.isMobile() ? 'practera-popup lock-assessment-popup' : 'practera-popup lock-assessment-popup desktop-view',
      },
      event
    );
    return modal;
  }

  /**
   * pop up activity complete notification and detail
   *
   * sample call for activity complete popup
   * NotificationService.activityCompletePopUp(3);
   */
  async activityCompletePopUp(activityId: number, activityCompleted: boolean) {
    let cssClass = 'practera-popup activity-complete-popup';
    if (this.utils.isMobile()) {
      cssClass += ' mobile-view';
    }
    return await this.modal(
      ActivityCompletePopUpComponent,
      { activityId, activityCompleted },
      {
        cssClass: cssClass,
        keyboardClose: false,
        backdropDismiss: false
      }
    );
  }

  async loading(opts?: LoadingOptions): Promise<void> {
    const loading = await this.loadingController.create(opts || {
      spinner: 'dots',

    });
    return loading.present();
  }
}
