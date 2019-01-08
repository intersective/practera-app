import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalPage } from './modal/modal.page';
import { FastFeedbackService } from './fast-feedback.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  selector: 'app-fast-feedback',
  templateUrl: './fast-feedback.component.html',
  styleUrls: ['./fast-feedback.component.scss']
})
export class FastFeedbackComponent implements OnInit {
  fastFeedbackForm: FormGroup;
  questions = [];

  constructor(
    public modalController: ModalController,
    private fastFeedbackService: FastFeedbackService,
    private utils: UtilsService,
    private notification: NotificationService,
  ) {}

  ngOnInit() {
    let group: any = {};
    this.questions.forEach(question => {
      group[question.id] = new FormControl('', Validators.required);
    });
    this.fastFeedbackForm = new FormGroup(group);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  submit() {
    console.log(this.fastFeedbackForm);
    const formData = this.fastFeedbackForm.value;
    const data = [];
    this.utils.each(formData, (answer, questionId) => {
      data.push({
        id: questionId,
        choice_id: answer,
      });
    });

    console.log(data);
    this.fastFeedbackService.submit(data).subscribe(res => {
      this.notification.alert({
        header: 'Submission Successful',
        subHeader: 'Subtitle',
        message: 'Thanks for taking time to answer the feedback question.',
        buttons: [{
          text: 'OK',
          handler: () => {
            return this.dismiss();
          },
        }],
      });
    });
  }
}
