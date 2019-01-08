import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalOptions } from '@ionic/core';
import { FastFeedbackComponent } from './fast-feedback.component';
import { RequestService } from '@shared/request/request.service';
import { NotificationService } from '@shared/notification/notification.service';

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
    private notification: NotificationService,
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

    const modal = this.notification.modal(FastFeedbackComponent, props, {
      backdropDismiss: false,
      showBackdrop: false,
    });
  }
}
