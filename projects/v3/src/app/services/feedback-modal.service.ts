import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalOptions } from '@ionic/core';
import { FastFeedbackComponent } from '../components/fast-feedback/fast-feedback.component';

export interface Meta {
  context_id?: number;
  team_id?: number;
  target_user_id?: number;
  team_name?: string;
  assessment_name?: string;
}

export interface Question {
  id?: number;
  title?: string;
  description?: string;
  choices?: Array<any>;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackModalService {

  constructor(
    private modalController: ModalController
  ) {}

  /**
   * Creates a modal for fast feedback
   */
  async createFastFeedbackModal(
    props: {
      questions?: Array<Question>;
      meta?: Meta | Object;
    },
    options: {
      closable?: boolean;
      modalOnly?: boolean;
      backdropDismiss?: boolean;
      showBackdrop?: boolean;
      [key: string]: any;
    } = {}
  ): Promise<HTMLIonModalElement> {
    const modalConfig: ModalOptions = {
      component: FastFeedbackComponent,
      componentProps: props,
      backdropDismiss: options?.closable === true || options?.backdropDismiss === true,
      showBackdrop: options?.showBackdrop !== false,
      ...options
    };

    const modal = await this.modalController.create(modalConfig);
    await modal.present();
    return modal;
  }
}
