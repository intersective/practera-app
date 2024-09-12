import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { RequestService } from 'request';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { DemoService } from '../../services/demo.service';

export interface Meta {
  context_id: number;
  team_id: number;
  target_user_id: number;
  team_name: string;
  assessment_name: string;
}

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

  constructor(
    public modalController: ModalController,
    private utils: UtilsService,
    public storage: BrowserStorageService,
    private request: RequestService,
    private demo: DemoService
  ) {}

  get isMobile() {
    return this.utils.isMobile();
  }

  ngOnInit() {
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


    let submissionResult;
    try {
      submissionResult = await this.submitData(data, params).toPromise();

      this.submissionCompleted = true;
      return setTimeout(
        () => {
          return this.dismiss(submissionResult);
        },
        2000
      );
    } catch (err) {
      console.error(err); // output error in devtool

      // set to true to fail gracefully
      this.submissionCompleted = true;
      this.dismiss(submissionResult);
    }
  }

  get isRedColor(): boolean {
    return this.utils.isColor('red', this.storage.getUser().colors?.primary);
  }

  submitData(data, params): Observable<any> {
    if (environment.demo) {
      // eslint-disable-next-line no-console
      console.log('data', data, 'params', params);
      return this.demo.normalResponse('observable') as Observable<any>;
    }
    return this.request.post(
      {
        endPoint: 'api/v2/observation/slider/create.json',
        data,
        httpOptions: { params }
      });
  }
}
