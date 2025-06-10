import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { RequestService } from 'request';
import { environment } from '../../../environments/environment';
import { first, Observable } from 'rxjs';
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

  // pagination properties
  currentPage = 0;
  questionsPerPage = 3;
  totalPages = 0;
  showPagination = true;

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

    this.totalPages = Math.ceil(this.questions.length / this.questionsPerPage);
    this.showPagination = this.totalPages > 1;
  }

  get currentPageQuestions() {
    const startIndex = this.currentPage * this.questionsPerPage;
    const endIndex = Math.min(startIndex + this.questionsPerPage, this.questions.length);
    return this.questions.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  goToPage(index: number) {
    if (index >= 0 && index < this.totalPages) {
      this.currentPage = index;
    }
  }

  isCurrentPageValid(): boolean {
    const questionsOnPage = this.currentPageQuestions;
    return questionsOnPage.every(question =>
      this.fastFeedbackForm.controls[question.id].valid);
  }

  get currentPageRange(): { start: number, end: number, total: number } {
    const start = this.currentPage * this.questionsPerPage + 1;
    const end = Math.min(start + this.currentPageQuestions.length - 1, this.questions.length);
    return { start, end, total: this.questions.length };
  }

  isPageCompleted(pageIndex: number): boolean {
    const startIndex = pageIndex * this.questionsPerPage;
    const endIndex = Math.min(startIndex + this.questionsPerPage, this.questions.length);
    const pageQuestions = this.questions.slice(startIndex, endIndex);

    return pageQuestions.every(question =>
      this.fastFeedbackForm.controls[question.id].valid);
  }

  get allQuestionsAnswered(): boolean {
    return this.fastFeedbackForm.valid;
  }

  async submit(): Promise<any> {
    if (!this.allQuestionsAnswered) {
      // If not all questions are answered, navigate to the first incomplete page
      for (let i = 0; i < this.totalPages; i++) {
        if (!this.isPageCompleted(i)) {
          this.goToPage(i);
          return;
        }
      }
      return;
    }

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
    this.storage.set("fastFeedbackOpening", false);
    this.modalController.dismiss(data);
    this.homeService.getPulseCheckStatuses().subscribe();
    this.homeService.getPulseCheckSkills().subscribe();
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
