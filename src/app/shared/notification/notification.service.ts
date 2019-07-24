import { Injectable } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { AlertOptions } from '@ionic/core';
import { PopUpComponent } from './pop-up/pop-up.component';
import { AchievementPopUpComponent } from './achievement-pop-up/achievement-pop-up.component';
import { Achievement, AchievementsService } from '@app/achievements/achievements.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    public achievementService: AchievementsService,
  ) {}

  dismiss() {
    return this.modalController.dismiss();
  }

  /**
   * @name modalConfig
   * @description futher customised filter
   */
  private modalConfig({ component, componentProps }, options = {}) {
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

  async modal(component, componentProps, options?) {
    const modal = await this.modalController.create(this.modalConfig({ component, componentProps }, options));
    return await modal.present();
  }

  async alert(config: AlertOptions) {
    const alert = await this.alertController.create(config);
    return await alert.present();
  }

  // toast message pop up, by default, shown success message for 2 seconds.
  async presentToast(message, success= true, duration= 2000) {
    let color = 'success';
    if (!success) {
      color = 'danger';
    }
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'top',
      color : color
    });
    toast.present();
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
      cssClass: 'achievement-popup',
      keyboardClose: false,
      backdropDismiss: false
    });
    return modal;
  }
}
