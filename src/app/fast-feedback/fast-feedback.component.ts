import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalPage } from './modal/modal.page';
import { FastFeedbackService } from './fast-feedback.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fast-feedback',
  templateUrl: './fast-feedback.component.html',
  styleUrls: ['./fast-feedback.component.scss']
})
export class FastFeedbackComponent implements OnInit {
  fastFeedbackForm: FormGroup;

  constructor(
    public modalController: ModalController,
    private fastFeedbackService: FastFeedbackService,
  ) {}

  ngOnInit() {
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage,
      componentProps: { value: 123 }
    });
    return await modal.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  submit() {
    console.log(this.fastFeedbackForm);
    // this.fastFeedbackService.submit();
  }
}
