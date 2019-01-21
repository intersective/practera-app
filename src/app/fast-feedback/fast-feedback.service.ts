import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FastFeedbackComponent } from './fast-feedback.component';
import { RequestService } from '@shared/request/request.service';

export interface Choice {
  id: number;
  title: string;
}
export interface Question {
  id: number;
  title: string;
  description: string;
  choices: Array<Choice>;
}
export interface Meta {
  context_id: number;
  team_id: number;
  target_user_id: number;
  team_name: string;
  assessment_name: string;
}

const api = {
  fastFeedback: 'api/v2/observation/slider/list.json',
  submit: 'api/v2/observation/slider/create.json',
};
@Injectable({
  providedIn: 'root'
})
export class FastFeedbackService {
  constructor(
    private modalController: ModalController,
    private request: RequestService,
  ) {}

  getFastFeedback() {
    return this.request.get(api.fastFeedback);
  }

  submit(data, params) {
    return this.request.post(api.submit, data, {params: params});
  }
}
