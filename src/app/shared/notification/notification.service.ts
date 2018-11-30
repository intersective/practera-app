import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PopUpComponent } from './pop-up/pop-up.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    public modalController: ModalController
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
}
