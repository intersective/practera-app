import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalPage } from './modal/modal.page';
import { FastFeedbackService } from './fast-feedback.service';
import { FormGroup, FormControl } from '@angular/forms';
import { UtilsService } from '@services/utils.service';

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
  ) {}

  ngOnInit() {
    let group: any = {};
    this.questions.forEach(question => {
      group[question.id] = new FormControl('');
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
    // this.fastFeedbackService.submit(data);
  }
}
