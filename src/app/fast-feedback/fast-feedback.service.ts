import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalOptions } from '@ionic/core';
import { FastFeedbackComponent } from './fast-feedback.component';

@Injectable({
  providedIn: 'root'
})
export class FastFeedbackService {
  private modalConfig: ModalOptions = {
    component: FastFeedbackComponent,
    componentProps: {
      data: {},
    }
  };  

  constructor(
    private modalController: ModalController
  ) {}

  // show pop up message 
  // this is using pop-up.component.ts as the view
  // put redirect = false if don't need to redirect
  async popUp(props: any = {}) {
    const data = Object.assign(this.modalConfig.componentProps, props);
    const config = Object.assign(this.modalConfig, data);

    const modal = await this.modalController.create(config);
    return await modal.present();
  }
}
