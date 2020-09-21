import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Meta } from './fast-feedback.service';
import { FastFeedbackSubmitterService } from './fast-feedback-submitter.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { Subscription } from 'rxjs';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-fast-feedback',
  templateUrl: './fast-feedback.component.html',
  styleUrls: ['./fast-feedback.component.scss']
})
export class FastFeedbackComponent implements OnInit {
  fastFeedbackForm: FormGroup;
  questions = [];
  meta: Meta;
  loading = false;
  submissionCompleted: Boolean;
  newRelicTracer: any;

  constructor(
    public modalController: ModalController,
    private fastFeedbackSubmitterService: FastFeedbackSubmitterService,
    private utils: UtilsService,
    private notification: NotificationService,
    public storage: BrowserStorageService,
    private newRelic: NewRelicService
  ) {}

  ngOnInit() {
    this.newRelicTracer = this.newRelic.createTracer('fastfeedback shown');
    this.newRelic.setPageViewName('Fast feedback popup');
    const group: any = {};
    this.questions.forEach(question => {
      group[question.id] = new FormControl('', Validators.required);
    });
    this.fastFeedbackForm = new FormGroup(group);
    this.submissionCompleted = false;
  }

  dismiss(data) {
    // change the flag to false
    this.storage.set('fastFeedbackOpening', false);
    this.modalController.dismiss(data);
  }

  async submit(): Promise<any> {
    this.loading = true;
    const formData = this.fastFeedbackForm.value;
    const data = [];

    this.utils.each(formData, (answer, questionId) => {
      data.push({
        id: questionId,
        choice_id: answer,
      });
    });

    // prepare parameters
    const params = {
      context_id: this.meta.context_id
    };
    // if team_id exist, pass team_id
    if (this.meta.team_id) {
      params['team_id'] = this.meta.team_id;
    } else if (this.meta.target_user_id) {
      // otherwise, pass target_user_id
      params['target_user_id'] = this.meta.target_user_id;
    }

    const nrFastFeedbackSubmissionTracer = this.newRelic.createTracer('fastfeeback submission');

    const submissionResult = await this.fastFeedbackSubmitterService.submit(data, params).toPromise();
    nrFastFeedbackSubmissionTracer();

    this.submissionCompleted = true;
    return setTimeout(
      () => {
        this.newRelicTracer();
        return this.dismiss(submissionResult);
      },
      2000
    );
  }
}
