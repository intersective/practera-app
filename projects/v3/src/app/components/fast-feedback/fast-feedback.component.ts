import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { RequestService } from 'request';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { DemoService } from '../../services/demo.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { HomeService } from '@v3/app/services/home.service';
import { NotificationsService } from '@v3/services/notifications.service';

export interface Meta {
  context_id: number;
  team_id: number;
  target_user_id: number;
  team_name: string;
  assessment_name: string;
}

@Component({
  selector: "app-fast-feedback",
  templateUrl: "./fast-feedback.component.html",
  styleUrls: ["./fast-feedback.component.scss"],
})
export class FastFeedbackComponent implements OnInit {
  fastFeedbackForm: FormGroup;
  loading = false;
  submissionCompleted: boolean;
  isMobile: boolean;

  @Input() questions = [];
  @Input() meta?: Meta;
  @Input() closable: boolean;

  constructor(
    private modalController: ModalController,
    private utils: UtilsService,
    private fastFeedbackService: FastFeedbackService,
    private storage: BrowserStorageService,
    private navParams: NavParams,
    private homeService: HomeService,
    private notificationsService: NotificationsService,
    private request: RequestService,
    private demo: DemoService
  ) {
    this.isMobile = this.utils.isMobile();
  }

  ngOnInit() {
    const group: any = {};
    this.questions.forEach((question) => {
      group[question.id] = new FormControl(null, Validators.required);
    });
    this.fastFeedbackForm = new FormGroup(group);
    this.submissionCompleted = false;
    const modal = this.navParams.get('modal');
    this.closable = modal.closable || false;
  }

  async submit(): Promise<any> {
    this.loading = true;
    const formData = this.fastFeedbackForm.value;
    const answers = [];

    this.utils.each(formData, (answer, questionId) => {
      answers.push({
        questionId: +questionId,
        choiceId: answer,
      });
    });

    // prepare parameters
    const params: {
      contextId?: number;
      teamId?: number;
      targetUserId?: number;
    } = {
      contextId: this.meta?.context_id,
      teamId: null,
      targetUserId: null,
    };

    // for temporary, "closable = true" is an indicator of this pulsecheck is opened from the traffic light group (self-assessment)
    if (this.closable === true) {
      params.teamId = this.storage.getUser().teamId;
    } else {
      // if team_id exist, pass team_id
      if (this.meta?.team_id) {
        params.teamId = this.meta?.team_id;
      } else if (this.meta?.target_user_id) {
        // otherwise, pass target_user_id
        params.targetUserId = this.meta?.target_user_id;
      }
    }

    let submissionResult;
    try {
      submissionResult = await firstValueFrom(this.fastFeedbackService
        .submit(answers, params));

      // Check if question 7's answer is 0
      const question7Answer = formData['7']; // hardcoded question id 7 (1st fast feedback question)
      if (question7Answer === 0) { // if answer is No (where value = 0)
        await this.notificationsService.showTeamCheckInAlert();
      }

      this.submissionCompleted = true;
      return setTimeout(() => {
        return this.dismiss(submissionResult);
      }, 2000);
    } catch (err) {
      console.error(err); // output error in devtool

      // set to true to fail gracefully
      this.submissionCompleted = true;
      this.dismiss(submissionResult);
    }
  }

  dismiss(data) {
    // change the flag to false
    this.storage.set("fastFeedbackOpening", false);
    this.modalController.dismiss(data);
    this.homeService.getPulseCheckStatuses().subscribe();
  }

  get isRedColor(): boolean {
    return this.utils.isColor("red", this.storage.getUser().colors?.primary);
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
