import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalOptions } from '@ionic/core';
import { FastFeedbackComponent } from './fast-feedback.component';
import { RequestService } from '@shared/request/request.service';

const api = {
  instantFeedback: '/api/v2/observation/slider/list',
  submit: '/api/v2/observation/slider/create',
};
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
    private modalController: ModalController,
    private request: RequestService,
  ) {}

  getInstantFeedback() {
    return this.request.get(api.instantFeedback);
  }

  submit(data) {
    return this.request.post(api.submit, data);
  }

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
