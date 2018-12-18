import { Injectable } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AlertOptions } from '@ionic/core';
import { PopUpComponent } from './pop-up/pop-up.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  // show pop up message 
  // this is using pop-up.component.ts as the view
  // put redirect = false if don't need to redirect
  async popUp(type, data, redirect) {
    const modal = await this.modalController.create({
      component: PopUpComponent,
      componentProps: { 
        type: type,
        data: data,
        redirect: redirect
      }
    });
    return await modal.present();
  }

  async confirm(config: AlertOptions) {
    const confirm = await this.alertController.create(config);
    return await confirm.present();
  }
}
