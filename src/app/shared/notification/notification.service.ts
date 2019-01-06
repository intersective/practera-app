import { Injectable } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { AlertOptions } from '@ionic/core';
import { PopUpComponent } from './pop-up/pop-up.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  /**
   * @name modalConfig
   * @description futher customised filter
   */
  private modalConfig({ component, componentProps }) {
    return {
      component,
      componentProps,
    };
  }

  // show pop up message
  // this is using pop-up.component.ts as the view
  // put redirect = false if don't need to redirect
  async popUp(type, data, redirect:any = false) {
    const component = PopUpComponent;
    const componentProps = {
      type,
      data,
      redirect,
    };
    const modal = await this.modalController.create(this.modalConfig({ component, componentProps }));
    return await modal.present();
  }

  async modal(component, componentProps) {
    const modal = await this.modalController.create(this.modalConfig({ component, componentProps }));
    return await modal.present();
  }

  async alert(config: AlertOptions) {
    const alert = await this.alertController.create(config);
    return await alert.present();
  }

  // toast message pop up, by default, shown success message for 2 seconds.
  async presentToast(message, success=true, duration=2000) {
    let color = 'success'
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
}
