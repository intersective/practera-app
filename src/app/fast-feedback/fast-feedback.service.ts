import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalOptions } from '@ionic/core';
import { FastFeedbackComponent } from './fast-feedback.component';
import { RequestService } from '@shared/request/request.service';
import { NotificationService } from '@shared/notification/notification.service';

interface Choice {
  id: number;
  title: string;
}
interface Question {
  id: number;
  title: string;
  description: string;
  choices: Choice[];
}

const api = {
  fastFeedback: '/api/v2/observation/slider/list',
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

  getFastFeedback() {
    return this.request.get(api.fastFeedback);
  }

  submit(data) {
    return this.request.post(api.submit, data);
  }

  // show pop up message
  // this is using pop-up.component.ts as the view
  // put redirect = false if don't need to redirect
  async popUp(props: { questions?: Question[]; } = {}) {
    const data = Object.assign(this.modalConfig.componentProps, props);
    const config = Object.assign(this.modalConfig, data);

    const modal = await this.notification.modal(FastFeedbackComponent, props, {
      backdropDismiss: false,
      showBackdrop: false,
      presentModal: false, // false: do not display modal rightaway || true: display modal instantly
    });
    return await modal.present();
  }
}
