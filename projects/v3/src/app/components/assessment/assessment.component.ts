import { environment } from '@v3/environments/environment';
import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, OnInit, QueryList, ViewChildren, ChangeDetectionStrategy, ViewChild, signal, ElementRef, SimpleChanges } from '@angular/core';
import { Assessment, Submission, AssessmentReview, AssessmentSubmitParams, AssessmentService } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { BehaviorSubject, debounceTime, Observable, of, Subject, Subscription, timer } from 'rxjs';
import { concatMap, take, delay, filter, takeUntil, tap } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { TextComponent } from '../text/text.component';
import { OneofComponent } from '../oneof/oneof.component';
import { TeamMemberSelectorComponent } from '../team-member-selector/team-member-selector.component';
import { MultiTeamMemberSelectorComponent } from '../multi-team-member-selector/multi-team-member-selector.component';
import { MultipleComponent } from '../multiple/multiple.component';
import { SliderComponent } from '../slider/slider.component';
import { Task } from '@v3/app/services/activity.service';
import { ActivityService } from '@v3/app/services/activity.service';
import { FileInput, Question, SubmitActions } from '../types/assessment';
import { FileUploadComponent } from '../file-upload/file-upload.component';

const MIN_SCROLLING_PAGES = 6; // minimum number of pages to show pagination scrolling

/**
 * Assessment Component with optional pagination feature
 *
 * Pagination can be enabled/disabled via environment.featureToggles.assessmentPagination
 * When disabled, all assessment questions will be displayed on a single page
 * When enabled, questions are split across multiple pages based on pageSize
 */
@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss'],
  animations: [
    trigger('tickAnimation', [
      state('visible', style({
        transform: 'scale(1)',
        opacity: 1,
        willChange: 'transform, opacity'
      })),
      state('hidden', style({
        transform: 'scale(0)',
        opacity: 0,
        willChange: 'transform, opacity'
      })),
      transition('hidden => visible', animate('200ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
      transition('visible => hidden', animate('100ms cubic-bezier(0.4, 0.0, 1, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * -- action --
   * Options: assessment/review
   *
   * 'assessment' is for user to do assessment, including
   * reading a submission or feedback. This actually
   * means the current user is the user who should "do" this assessment
   *
   * 'reivew' is for user to do review for this assessment. This means the
   * current user is the user who should "review" this assessment
   */
  @Input() action: 'assessment' | 'review';
  @Input() task: Task; // current task needed for dueDate (CORE-6343)
  @Input() assessment: Assessment = null;
  @Input() contextId: number;
  @Input() activityId?: number;
  @Input() submission?: Submission;
  @Input() review: AssessmentReview;
  @Input() isSinglePage?: boolean = false;

  // the text of when the submission get saved last time
  @Input() savingMessage$: BehaviorSubject<string>;

  // whether the bottom button(and the save button) is disabled
  @Input() btnDisabled$: BehaviorSubject<boolean>;

  // save the assessment/review answers
  @Output() save = new EventEmitter();
  // mark the feedback as read
  @Output() readFeedback = new EventEmitter();
  // continue to the next task
  @Output() continue = new EventEmitter();
  @ViewChildren('questionField') questionComponents: QueryList<TextComponent | OneofComponent | FileUploadComponent | TeamMemberSelectorComponent | MultiTeamMemberSelectorComponent | MultipleComponent | SliderComponent>;

  autosaving = signal<{ [key: number]: boolean }>({});
  saved = signal<{ [key: number]: boolean }>({});
  failed = signal<{ [key: number]: boolean }>({});

  onAnimationEnd(event, questionId: number) {
    if (event.toState === 'visible') {
      // Animation has ended with the tick being visible, now toggle the saved flag after a short delay
      timer(1000).pipe(take(1)).subscribe(() => {
        const currentValues = this.autosaving();
        this.autosaving.set({ ...currentValues, [questionId]: false });
      });
    }
  }

  // used to resubscribe to the assessment service
  resubscribe$ = new Subject<void>();
  // used to save the assessment/review answers
  submitActions = new Subject<SubmitActions>();
  subscriptions: Subscription[] = [];
  unsubscribe$ = new Subject<void>();

  // if doAssessment is true, it means this user is actually doing assessment, meaning it is not started or is in progress
  // if action == 'assessment' and doAssessment is false, it means this user is reading the submission or feedback
  doAssessment: boolean;

  // if isPendingReview is true, it means this review is WIP, meaning this assessment is pending review
  // if action == 'review' and isPendingReview is false, it means the review is done and this student is reading the submission and review
  isPendingReview = false;

  // whether the learner has seen the feedback
  feedbackReviewed = false;

  // virtual element id for accessibility "aria-describedby" purpose
  elIdentities = {};

  // to hide assessment content if user not is a team.
  isNotInATeam = false;

  questionsForm?: FormGroup = new FormGroup({});

  @ViewChild('form') form?: HTMLFormElement;

  // pagination
  pageRequiredCompletion: boolean[] = []; // indicator for required questions
  readonly manyPages = MIN_SCROLLING_PAGES;

  @ViewChildren('questionBox') questionBoxes!: QueryList<{ el: HTMLElement }>;
  @ViewChild('pageIndicatorsContainer') pageIndicatorsContainer: ElementRef;

  // prevent non participants from submitting team assessment
  get preventSubmission() {
    return this._preventSubmission();
  }

  constructor(
    readonly utils: UtilsService,
    private notifications: NotificationsService,
    private storage: BrowserStorageService,
    private sharedService: SharedService,
    private assessmentService: AssessmentService,
    private activityService: ActivityService,
  ) {
    this.resubscribe$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.subscribeSaveSubmission();
    });
  }

  // make sure video is stopped when user leave the page
  ionViewWillLeave() {
    this.sharedService.stopPlayingVideos();
  }

  pageSize = 8; // number of questions per page
  pageIndex = 0;

  // each entry is a page: an array of (partial) groups
  pagesGroups: { name: string; description?: string; questions: Question[] }[][] = [];

  // Feature toggle for pagination
  get isPaginationEnabled(): boolean {
    return environment.featureToggles?.assessmentPagination ?? true;
  }

  // override to use question‑based pages
  get pageCount() {
    return this.isPaginationEnabled ? this.pagesGroups.length : 1;
  }

  get pagedGroups() {
    if (!this.isPaginationEnabled) {
      // Return all groups as a single page when pagination is disabled
      return this.assessment?.groups || [];
    }
    return this.pagesGroups[this.pageIndex] || [];
  }

  prevPage() {
    if (!this.isPaginationEnabled) return;
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.scrollActivePageIntoView();
    }
  }

  nextPage() {
    if (!this.isPaginationEnabled) return;
    if (this.pageIndex < this.pageCount - 1) {
      this.pageIndex++;
      this.scrollActivePageIntoView();
    }
  }

  get pages(): number[] {
    if (!this.isPaginationEnabled) return [0];
    return Array(this.pageCount).fill(0).map((_, i) => i);
  }

  goToPage(i: number) {
    if (!this.isPaginationEnabled) return;
    if (i >= 0 && i < this.pageCount) {
      this.pageIndex = i;
      this.scrollActivePageIntoView();
    }
  }

  ngOnInit(): void {
    this.subscribeSaveSubmission();
  }

  getQuestionBoxById(id) {
    return this.questionBoxes.find(boxes => boxes.el.id === id);
  }

  getQuestionBoxes() {
    return this.questionBoxes;
  }

  subscribeSaveSubmission() {
    this.submitActions.pipe(
      filter(() => !this._preventSubmission()), // skip when false
      concatMap(request => {
        if (request?.reviewSave) {
          this.saved[request.reviewSave.questionId] = true;
          return this.saveReviewAnswer(request.reviewSave);
        }

        if (request?.questionSave) {
          const currentValues = this.autosaving();
          this.autosaving.set({ ...currentValues, [request.questionSave.questionId]: true });
          this.saved[request.questionSave.questionId] = false;
          this.failed[request.questionSave.questionId] = false;
          return this.saveQuestionAnswer(request.questionSave);
        }
        return of(request);
      }),
    ).subscribe({
      next: (data: {
        autoSave: boolean; // true: this request is for autosave; false: request is for submission (manual submission);
        goBack: boolean;
        questionSave?: {
          submissionId: number;
          questionId: number;
          answer: string;
        };
        error?: any;
      }): void | Promise<void> => {
        if (data.autoSave === false) {
          return this._submitAnswer(data);
        }
      },
      // save/submission error handling http 500
      error: async (error: any) => {
        if (error.message.includes('Autosave')) {
          await this.notifications.assessmentSubmittedToast({
            isFail: true,
            label: $localize`Auto save failed. Please try again.`,
          });
          // Resubscribe for autosave failures
          this.resubscribe$.next();
        } else {
          await this.notifications.assessmentSubmittedToast({ isFail: true });
          // @link https://github.com/intersective/core-graphql-api/commit/92e636be64a3697bebda91d6f66eea487d8fb2a9#diff-4f45773ff5b570b41418d857c86f5b1e48b8e7ed744d92ebef4b96102de912e3R17-R22

          if ((error.message.toLowerCase()).includes('invalid answer')) {
            let message = $localize`An error has occurred. The page will reload shortly; please try again.`;

            const invalidSaveErrors = this.storage.get('saveAssessmentErrors');
            const errQuantity = invalidSaveErrors?.length;
            if (errQuantity > 2) {
              const lastError = invalidSaveErrors[errQuantity - 1];
              message = $localize`Your answers couldn't be saved. Please reach out to your coordinator for help.` + `\n` + this.invalidAnswerEmailContent(lastError);
            }
            await this.notifications.alert({
              header: $localize`Error`,
              message,
              buttons: [
                {
                  text: $localize`OK`,
                  role: 'cancel',
                  handler: () => {
                    window.location.reload(); // force reload
                  }
                }
              ],
            });
          }
        }
      }
    });
  }

  // Email content for repeated invalid answer error
  private invalidAnswerEmailContent(rawData) {
    const body = `Hi Team,\n
I am experiencing issues with submitting my assessment answers.\n
Please do not change anything below this line - this information will help the Practera team identify the issue\n
Assessment ID: ${this.assessment.id}
Activity ID: ${this.activityId}\n\n
Question Info: ${JSON.stringify(rawData)}\n\n
Error: Invalid answer format detected\n
Best regards`;

    return `<a href="mailto:${environment.helpline}?subject=Assessment%20Answer%20Invalid&body=${encodeURIComponent(body)}">${environment.helpline}</a>`;
  }

  /**
   * prevent non participants from submitting assessment
   * @returns {boolean} - true if user is not a participant and assessment is for team
   */
  private _preventSubmission(): boolean {
    let result = false;
    if (this.action === 'assessment' && this.assessment?.isForTeam === true && this.storage.getUser().role !== 'participant') {
      result = true;
    }
    return result;
  }

  retrySave(question): void {
    const currentValues = this.autosaving();
    this.autosaving.set({ ...currentValues, [question.id]: true });
    this.questionComponents?.forEach((questionComponent) => {
      if (questionComponent?.question?.id === question?.id) {
        questionComponent.triggerSave();
      }
    });
  }

  /**
   * Saves the answer for a given question within a submission.
   *
   * @param {Object} questionInput - An object containing the necessary information for saving the answer.
   * @param {number} questionInput.submissionId - The ID of the submission in which the answer belongs.
   * @param {number} questionInput.questionId - The ID of the question being answered.
   * @param {string} questionInput.answer - The answer to the question.
   *
   * @returns {Observable} An Observable that resolves with the response from the assessment service.
   */
  saveQuestionAnswer(questionInput: {
    submissionId: number;
    questionId: number;
    answer?: string;
    file?: FileInput;
  }): Observable<any> {
    const answer = this._getAnswerValueForQuestion(questionInput.questionId, questionInput.answer);

    this.filledAnswers().forEach(answerObj => {
      if (answerObj.questionId === questionInput.questionId) {
        // if the answer is empty, we need to set it to null
        if (this.utils.isEmpty(answer)) {
          answerObj.answer = null;
        } else {
          answerObj.answer = answer;
        }
      }
    });

    return this.assessmentService.saveQuestionAnswer(
      questionInput.submissionId,
      questionInput.questionId,
      answer,
      questionInput.file,
    ).pipe(
      tap({
        next: (_res) => {
          const currentValues = this.autosaving();
          this.autosaving.set({ ...currentValues, [questionInput.questionId]: false });

          const savedValues = this.saved();
          this.saved.set({ ...savedValues, [questionInput.questionId]: true });
        },
        error: (error: unknown) => {
          const currentValues = this.autosaving();
          this.autosaving.set({ ...currentValues, [questionInput.questionId]: false });

          const savedValues = this.saved();
          this.saved.set({ ...savedValues, [questionInput.questionId]: false });

          const failedValues = this.failed();
          this.failed.set({ ...failedValues, [questionInput.questionId]: true });
        }
      }),
      delay(800),
    );
  }

  saveReviewAnswer(questionInput: {
    reviewId: number;
    submissionId: number;
    questionId: number;
    answer?: string;
    comment: string;
    file?: FileInput;
  }): Observable<any> {
    const answer = this._getAnswerValueForQuestion(questionInput.questionId, questionInput.answer);
    const comment = (!this.utils.isEmpty(questionInput.comment)) ? questionInput.comment : '';

    const savedValues = this.saved();
    this.saved.set({ ...savedValues, [questionInput.questionId]: true });

    return this.assessmentService.saveReviewAnswer(
      questionInput.reviewId,
      questionInput.submissionId,
      questionInput.questionId,
      comment,
      answer,
      questionInput.file,
    );
  }

  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (!this.assessment) {
      return;
    }

    this._initialise();

    if (simpleChanges.assessment || simpleChanges.submission || simpleChanges.review) {
      this._handleSubmissionData();
      this._populateQuestionsForm();
      this._handleReviewData();
      this._populateFormWithAnswers();
      this._preventSubmission();
    }

    // split by question count every time assessment changes - only if pagination is enabled
    if (this.isPaginationEnabled) {
      this.pagesGroups = this.splitGroupsByQuestionCount();
      this.pageIndex = 0;
    } else {
      // Reset pagination data when disabled
      this.pagesGroups = [];
      this.pageIndex = 0;
    }

    // scroll to the active page into view after rendering
    setTimeout(() => this.scrollActivePageIntoView(), 200);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (!subscription.closed) {
        subscription.unsubscribe();
      }
    });
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private _initialise() {
    this.doAssessment = false;
    this.feedbackReviewed = false;
    this.questionsForm = new FormGroup({});
    this.isNotInATeam = false;
    this.isPendingReview = false;
  }

  /**
   * Validator to check if an answer is required.
   * @param control The form control to validate.
   * @returns An object with the validation error or null if valid.
   */
  private _answerRequiredValidatorForReviewer(control: FormControl) {
    const value = control.value;
    if (value === null) return { required: true };

    if (typeof value === 'object' && value !== null) {
      if ((!value.answer || value.answer.length === 0) && (!value.file || (Object.keys(value.file).length === 0))) {
        return { required: true };
      }
    } else if (typeof value === 'string') {
      if (value.length === 0) {
        return { required: true };
      }
    }
    return null;
  }

  private _fileRequiredValidatorForLearner(control: FormControl) {
    const value: FileInput = control.value;

    if (value === null || value === undefined) return { required: true };

    if (typeof value === 'object' && value !== null) {
      // check if file object has a url property (uploaded file)
      if (Object.entries(value).length === 0 || !value.url || value.url.length === 0) {
        return { required: true };
      }
    } else if (typeof value === 'string') {
      return { required: true };
    }
    return null;
  }

  // Populate the question form with FormControls.
  // The name of form control is like 'q-2' (2 is an example of question id)
  private _populateQuestionsForm() {
    // questions in multiple groups
    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        let validator = [];
        // check if the compulsory is mean for current user's role
        const isRequired = this._isRequired(question);
        // only apply required validators when user can actually edit (doAssessment or isPendingReview)
        if (isRequired === true && (this.doAssessment || this.isPendingReview )) {
          if (this.action === 'review' && ['text', 'file'].includes(question.type)) {
            validator = [this._answerRequiredValidatorForReviewer];
          } else if (question.type === 'file' && this.action === 'assessment') {
            validator = [this._fileRequiredValidatorForLearner];
          } else {
            validator = [Validators.required];
          }
        }

        // multiple initial answer
        let answer: string | object | any[] = '';
        if (question.type === 'multi team member selector') {
          answer = [];
        }

        this.questionsForm.addControl('q-' + question.id, new FormControl({
          answer,
          comment: '',
          file: null,
        }, validator));
      });
    });

    // when no questions in the assessment, disable the button
    if (this.utils.isEmpty(this.questionsForm.getRawValue())) {
      return this.btnDisabled$.next(true);
    }

    this.questionsForm.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      debounceTime(300),
    ).subscribe(() => {
      this.initializePageCompletion();
      // this.btnDisabled$.next(this.questionsForm.invalid);
      this.setSubmissionDisabled();
    });
  }

  /**
   * Use the submission data to determine if user is trying to
   * 1. do the assessment
   * 2. see the submission
   * 3. do the review
   */
  private _handleSubmissionData() {
    // If team assessment is locked, set the page to readonly mode.
    // set doAssessment, isPendingReview to false - when assessment is locked, user can't do both.
    // set submission status to done - we need to show readonly answers in question components.
    if (this.submission && this.submission.isLocked) {
      this.doAssessment = false;
      this.submission.status = 'done';
      this.btnDisabled$.next(true);
      return;
    }

    // user is trying to do the assessment if
    // - there is no submission or
    // - submission is in progress
    if (this.action !== 'review'
      && (
        this.utils.isEmpty(this.submission)
        || this.submission.status === 'in progress'
      )
    ) {
      this.doAssessment = true;
      if (this.submission) {
        this.savingMessage$.next($localize`Last saved ${this.utils.timeFormatter(this.submission.modified)}`);
      }
      return;
    }

    if (this.assessment.type === 'moderated') {
      // user is trying to do the review, if
      // - the submission is pending review and
      // - this.action is review
      if (this.submission?.status === 'pending review' && this.action === 'review') {
        this.isPendingReview = true;
      }
      return;
    }

    this.feedbackReviewed = this.submission.completed;
  }

  private _handleReviewData() {
    if (this.isPendingReview && this.review?.status === 'in progress') {
      this.savingMessage$.next($localize`Last saved ${this.utils.timeFormatter(this.review.modified)}`);
      this.btnDisabled$.next(false);
    }
  }

  /**
   * a consistent comparison logic to ensure mandatory status
   * @param {question} question
   */
  private _isRequired(question: Question): boolean {
    let role = 'submitter';

    if (this.action === 'review') {
      role = 'reviewer';
    }

    return (question.isRequired && question.audience.includes(role));
  }

  /**
   * @name _compulsoryQuestionsAnswered
   * @description to check if every compulsory question has been answered
   * @param {Object[]} answers a list of answer object (in submission-based format)
   */
  private _compulsoryQuestionsAnswered(answers): Question[] {
    const missing: Question[] = [];
    const answered = {};
    this.utils.each(answers, answer => {
      answered[answer.questionId] = answer;
    });

    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        if (this._isRequired(question)) {
          let isEmpty = false;
          const thisQuestion = answered[question.id];

          // for review: answer & file separated
          if (this.action === 'review' && this.utils.isEmpty(thisQuestion.answer) && this.utils.isEmpty(thisQuestion.file)) {
            isEmpty = true;

            // for assessment: file is part of the answer
          } else if (this.action === 'assessment' && (this.utils.isEmpty(thisQuestion) || this.utils.isEmpty(thisQuestion.answer))) {
            isEmpty = true;
          }

          if (isEmpty) {
            missing.push(question);

            // add highlight effect to the question
            const questionElement = this.form.nativeElement.querySelector(`#q-${question.id}`);
            if (questionElement) {
              questionElement.classList.add('flash-highlight');
            }
          }
        }
      });
    });

    return missing;
  }

  /**
   * When user click the bottom button
   */
  continueToNextTask() {
    switch (this._btnAction) {
      case 'submit':
        this.btnDisabled$.next(true);
        return this.submitActions.next({
          autoSave: false,
          goBack: false,
        });
      case 'readFeedback':
        this.btnDisabled$.next(true);
        return this.readFeedback.emit(this.submission.id);
      default:
        return this.continue.emit();
    }
  }

  /**
   * @name filledAnswers
   * @description to collect all latest answers from the form
   *
   * @return  {any[]}
   */
  filledAnswers(): any[] {
    const answers = [];
    let questionId = 0;
    let assessment: AssessmentSubmitParams;

    assessment = {
      id: this.assessment.id
    };

    if (this.submission && this.submission.id) {
      assessment.submissionId = this.submission.id;
    }

    // form submission answers (submission API doesn't accept zero length array)
    if (this.doAssessment) {
      assessment.contextId = this.contextId;

      if (this.assessment.isForTeam) {
        assessment.unlock = true;
      }
      this.utils.each(this.questionsForm.value, (value, key) => {
        questionId = +key.replace('q-', '');
        answers.push({
          questionId: questionId,
          answer: this._getAnswerValueForQuestion(questionId, value)
        });
      });
    } else if (this.isPendingReview) {
      // In review we also have comments for a question. and questionsForm value have both
      // answer and comment. need to add them as separately
      assessment = Object.assign(assessment, {
        reviewId: this.review.id
      });

      // post answers API doesn't accept empty array
      // compulsory format: (even when no answers provided)
      // [
      //   { questionId: 1, answer: null, comment: null },
      //   { questionId: 2, answer: null, comment: null },
      //   { questionId: 3, answer: null, comment: null },
      // ]
      this.utils.each(this.questionsForm.value, (answer, key) => {
        questionId = +key.replace('q-', '');
        const save: { questionId: number; answer: any; comment: any; file?: any } = {
          questionId,
          answer: this._getAnswerValueForQuestion(questionId, answer.answer),
          comment: answer?.comment,
        };
        if (answer.file) {
          save.file = answer.file;
        }

        answers.push(save);
      });
    }

    return answers;
  }

  private _getAnswerValueForQuestion(questionId: number, value: any): any {
    if (value || (Array.isArray(value) && value.length === 0)) {
      return value;
    }

    let answer = null; // null for one off / default value
    this.assessment.groups.forEach(group => {
      const currentQuestion = group.questions.find(question => question.id === questionId);
      if (currentQuestion) {
        switch (currentQuestion.type) {
          case 'multiple':
            answer = [];
            break;
          case 'text':
          case 'file': // answer is for text/oneof/multiple/slider only, file is always ''
          case 'team-member-selector':
          case 'multi-team-member-selector':
            answer = '';
            break;
          case 'slider':
            answer = null;
            break;
        }
      }
    });
    return answer;
  }

  async _submitAnswer({ autoSave = false, goBack = false }) {
    const answers = this.filledAnswers();
    // check if all required questions have answer when assessment done
    const requiredQuestions = this._compulsoryQuestionsAnswered(answers);

    if (!autoSave && requiredQuestions.length > 0) {
      this.btnDisabled$.next(false);
      // display a pop up if required question not answered
      return this.notifications.alert({
        message: $localize`Required question answer missing!`,
        buttons: [
          {
            text: $localize`Show me`,
            handler: () => {
              this.scrollToRequiredQuestion(`#q-${requiredQuestions[0].id}`);
            },
          },
          {
            text: $localize`OK`,
            role: 'cancel',
          }
        ],
      });
    }

    if (this.doAssessment === true) {
      try {
        // make sure teamId is up to date
        await this.sharedService.getTeamInfo().toPromise();

        if (this.assessment.isForTeam) {
          const teamId = this.storage.getUser().teamId;
          if (typeof teamId !== 'number') {
            this.btnDisabled$.next(false);
            return this.notifications.alert({
              message: $localize`Currently you are not in a team, please reach out to your Administrator or Coordinator to proceed with next steps.`,
              buttons: [
                {
                  text: $localize`OK`,
                  role: 'cancel',
                }
              ],
            });
          }
        }
      } catch (error) {
        this.btnDisabled$.next(false);
        return this.notifications.assessmentSubmittedToast({ isFail: true });
      }
    }

    return this.save.emit({
      autoSave,
      goBack,
      answers,
      assessmentId: this.assessment.id,
      contextId: this.contextId,
      submissionId: this.submission.id,
    });
  }

  showQuestionInfo(info, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    return this.notifications.popUp('shortMessage', { message: info });
  }

  // the action that the button does
  private get _btnAction() {
    if (this.doAssessment || this.isPendingReview) {
      return 'submit';
    }

    if (this.submission) {
      // condition: Published && feedbackReview is true
      if (this.submission.status === 'published' && !this.feedbackReviewed) {
        return 'readFeedback';
      }

      // condition: status not always = "Published", so we need to check by the submission status (completed = true means completed)
      if (this.submission.status === 'feedback available' && this.submission.completed === false) {
        return 'readFeedback';
      }
    }

    return 'continue';
  }

  // the text of the button
  get btnText() {
    switch (this._btnAction) {
      case 'submit':
        if (this.action === 'review') {
          return $localize`submit review`;
        }
        return $localize`submit answers`;
      case 'readFeedback':
        return $localize`mark feedback as reviewed`;
      default:
        return $localize`continue`;
    }
  }

  /**
   * status of access restriction
   *
   * @return  {boolean}  cached singlePageAccess in localstorage
   */
  get restrictedAccess() {
    return this.storage.singlePageAccess;
  }

  /**
   * generate random float for id attribute for a specific assessment
   *
   * @param   {string}  asmtName  assessment name
   *
   * @return  {string}        random number in string form
   */
  randomCode(asmtName: string): string {
    if (!this.elIdentities[asmtName]) {
      this.elIdentities[asmtName] = this.utils.randomNumber();
    }
    return this.elIdentities[asmtName];
  }

  get label() {
    if (!this.submission || this.submission.status === 'done') {
      return '';
    }
    // for locked team assessment
    if (this.assessment.isForTeam && this.submission?.isLocked) {
      return $localize`in progress`;
    }
    if (!this.submission?.status || this.submission?.status === 'in progress') {
      if (this.assessment.isOverdue) {
        return $localize`overdue`;
      }
      return '';
    }

    // for i18n
    if (this.submission?.status === 'pending review') {
      return $localize`pending review`;
    }
    if (this.submission?.status === 'feedback available') {
      return $localize`feedback available`;
    }

    return this.submission?.status;
  }

  get labelColor() {
    if (!this.submission || this.submission.status === 'done') {
      return '';
    }
    // for locked team assessment
    if (this.assessment?.isForTeam && this.submission?.isLocked) {
      return 'dark-blue';
    }
    switch (this.submission?.status) {
      case 'pending review':
        return 'warning black';
      case 'feedback available':
        return 'success';
    }
    if ((!this.submission?.status || this.submission?.status === 'in progress') && this.assessment?.isOverdue) {
      return 'danger';
    }
    return '';
  }

  // [AV2-1270] condition to present asterisk in more obvious color
  get isRedColor(): boolean {
    return this.utils.isColor('red', this.storage.getUser().colors?.primary);
  }

  /**
   * Resubmit the assessment submission
   * (mostly for regenerate AI feedback)
   */
  resubmit(): Subscription {
    if (!this.assessment?.id || !this.submission?.id || !this.activityId) {
      return;
    }

    this.btnDisabled$.next(true);
    return this.assessmentService.resubmitAssessment({
      assessment_id: this.assessment.id,
      submission_id: this.submission.id
    }).subscribe({
      next: async () => {
        this.activityService.getActivity(this.activityId);
        await this.assessmentService.fetchAssessment(this.assessment.id, 'assessment', this.activityId, this.contextId, this.submission.id).toPromise();
        this.btnDisabled$.next(false);
      },
      error: async () => {
        await this.notifications.assessmentSubmittedToast({
          isFail: true,
          label: $localize`Resubmit request failed. Please try again.`,
        });

        this.btnDisabled$.next(false);
      }
    });
  }

  flashBlink(element: HTMLElement) {
    // Add blink class
    element.classList.add('blink');

    // Remove the class after a short delay
    setTimeout(() => {
      element.classList.remove('blink');
    }, 2000); // Adjust the timeout as needed for blinking duration
  }

  scrollToRequiredQuestion(elementId): void {
    const element = document.querySelector(elementId);
    if (element) {
      this.utils.scrollToElement(element);
      this.flashBlink(element);
    }
  }

  /**
   * Breaks original groups into pages, each containing ≤ pageSize questions.
   * If a single group has more questions than pageSize, it gets sliced.
   */
  private splitGroupsByQuestionCount() {
    const pages = [];
    let currentPage = [];
    let count = 0;

    for (const group of this.assessment.groups) {
      const qCount = group.questions.length;

      if (count + qCount <= this.pageSize) {
        currentPage.push(group);
        count += qCount;

      } else {
        // flush current page
        if (currentPage.length) {
          pages.push(currentPage);
        }
        currentPage = [];
        count = 0;

        // if group itself is too big, slice it across multiple pages
        if (qCount > this.pageSize) {
          let start = 0;
          while (start < qCount) {
            const slice = {
              ...group,
              questions: group.questions.slice(start, start + this.pageSize)
            };
            pages.push([slice]);
            start += this.pageSize;
          }
        } else {
          currentPage.push(group);
          count = qCount;
        }
      }
    }

    if (currentPage.length) {
      pages.push(currentPage);
    }
    return pages;
  }

  trackById(index: number, item: any) {
    return item.id || index;
  }

  initializePageCompletion() {
    if (!this.isPaginationEnabled) return;

    this.pageRequiredCompletion = new Array(this.pageCount).fill(true);

    this.pages.forEach((page, index) => {
      const pageQuestions = this.getAllQuestionsForPage(index);
      this.pageRequiredCompletion[index] = this.areAllRequiredQuestionsAnswered(pageQuestions);
    });

    // Update the scroll position when page completion status changes
    setTimeout(() => this.scrollActivePageIntoView(), 100);
  }

  private getAllQuestionsForPage(pageIndex: number): Question[] {
    if (!this.isPaginationEnabled) {
      // If pagination is disabled, return all questions from all groups
      const allQuestions: Question[] = [];
      this.assessment?.groups?.forEach(group => {
        if (group.questions && group.questions.length) {
          allQuestions.push(...group.questions);
        }
      });
      return allQuestions;
    }

    if (!this.pagesGroups[pageIndex]) {
      return [];
    }

    const allQuestionsOnPage: Question[] = [];
    this.pagesGroups[pageIndex].forEach(group => {
      if (group.questions && group.questions.length) {
        allQuestionsOnPage.push(...group.questions);
      }
    });

    return allQuestionsOnPage;
  }

  private areAllRequiredQuestionsAnswered(questions: Question[]): boolean {
    if (!questions.length) {
      return true; // If no questions, consider it complete
    }

    // Only check required questions
    const requiredQuestions = questions.filter(question => this._isRequired(question));

    // If no required questions, page is considered complete
    if (requiredQuestions.length === 0) {
      return true;
    }

    // Check each required question if it has a valid answer
    return requiredQuestions.every(question => {
      const control = this.questionsForm?.controls[`q-${question.id}`];

      if (!control || control.invalid) {
        return false;
      }

      const value = control.value;
      if (Array.isArray(value)) {
        // multi choice questions
        return value.length > 0;
      } else if (typeof value === 'object' && value !== null) {
        // review questions with answer and comment fields
        return value.answer !== undefined && value.answer !== null && value.answer !== '';
      } else {
        // text / one off questions
        return value !== undefined && value !== null && value !== '';
      }
    });
  }

  /**
   * Find the first unanswered required question and navigate to it.
   * @returns {boolean}
   *    true: if an unanswered question was found and navigated to
   *    false: if all required questions are answered.
   */
  findAndGoToFirstUnansweredQuestion(): boolean {
    let currentPageQuestions: Question[];

    if (!this.isPaginationEnabled) {
      // If pagination is disabled, check all questions across all groups
      currentPageQuestions = [];
      this.assessment?.groups?.forEach(group => {
        if (group.questions && group.questions.length) {
          currentPageQuestions.push(...group.questions);
        }
      });
    } else {
      // Get all questions for the current page
      currentPageQuestions = this.getAllQuestionsForPage(this.pageIndex);
    }

    // Filter only the required questions
    const requiredQuestions = currentPageQuestions.filter(question => this._isRequired(question));

    // Find the first unanswered required question
    const unansweredQuestion = requiredQuestions.find(question => {
      const control = this.questionsForm?.controls[`q-${question.id}`];
      if (!control || control.invalid) {
        return true; // This question is unanswered
      }

      const value = control.value;
      if (Array.isArray(value)) {
        return value.length === 0; // Multi-choice question with no selections
      } else if (typeof value === 'object' && value !== null) {
        return !value.answer || value.answer === ''; // Review question with empty answer
      } else {
        return !value || value === ''; // Text/one-off question with empty value
      }
    });

    // If found an unanswered question, navigate to it
    if (unansweredQuestion) {
      const questionIndex = currentPageQuestions.findIndex(q => q.id === unansweredQuestion.id);
      if (questionIndex >= 0) {
        this.goToQuestion(questionIndex);
        return true; // Indicates we found and navigated to an unanswered question
      }
    }

    return false;
  }

  goToQuestion(index: number) {
    const questionBoxes = this.getQuestionBoxes();
    if (questionBoxes && questionBoxes.length > 0) {
      const questionBox = questionBoxes.toArray()[index];
      if (questionBox) {
        this.utils.scrollToElement(questionBox.el);
        this.flashBlink(questionBox.el);
      }
    }
  }

  /**
   * Scrolls the active page indicator into view within the pagination container
   */
  scrollActivePageIntoView() {
    if (!this.isPaginationEnabled) return;

    setTimeout(() => {
      if (this.pageIndicatorsContainer && this.pageCount > this.manyPages) {
        const container = this.pageIndicatorsContainer.nativeElement;
        const activeIndicator = document.getElementById(`page-indicator-${this.pageIndex}`);

        if (activeIndicator && container) {
          // Calculate the scroll position to center the active indicator
          const containerWidth = container.offsetWidth;
          const indicatorWidth = activeIndicator.offsetWidth;
          const indicatorLeft = activeIndicator.offsetLeft;

          // Scroll to position the active indicator in the center
          container.scrollLeft = indicatorLeft - (containerWidth / 2) + (indicatorWidth / 2);
        }
      }
    }, 50);
  }

  private _populateFormWithAnswers() {
    // Populate form with submission answers
    if (this.submission?.answers && this.action === 'assessment') {
      Object.keys(this.submission.answers).forEach(questionId => {
        const controlName = 'q-' + questionId;
        const control = this.questionsForm.get(controlName);
        if (control && this.submission.answers[questionId]?.answer !== undefined) {
          control.setValue(this.submission.answers[questionId].answer, { emitEvent: false });
        }
      });
    }

    // Populate form with review answers
    if (this.review?.answers && this.action === 'review') {
      Object.keys(this.review.answers).forEach(questionId => {
        const controlName = 'q-' + questionId;
        const control = this.questionsForm.get(controlName);
        if (control && this.review.answers[questionId]) {
          const reviewAnswer = {
            answer: this.review.answers[questionId].answer,
            comment: this.review.answers[questionId].comment,
            file: this.review.answers[questionId].file || null,
          };
          control.setValue(reviewAnswer, { emitEvent: false });
        }
      });
    }

    if (this.utils.isEmpty(this.submission?.answers) && this.utils.isEmpty(this.review?.answers) && this.questionsForm?.invalid) {
      this.setSubmissionDisabled();
    }

    // Initialize page completion after form is populated
    setTimeout(() => {
      this.initializePageCompletion();
    }, 100);
  }

  setSubmissionDisabled() {
    // only enforce form validation when user can actually edit
    if (!this.doAssessment && !this.isPendingReview) {
      return;
    }

    const isFormValid = this.questionsForm?.valid ?? false;
    const isCurrentlyDisabled = this.btnDisabled$.getValue();

    // Update button state only if it needs to change
    if (!isFormValid && !isCurrentlyDisabled) {
      this.btnDisabled$.next(true);
    } else if (isFormValid && isCurrentlyDisabled) {
      this.btnDisabled$.next(false);
    }
  }

  /**
   * determine if required indicators should be shown for a question
   * only show required indicators when user can actually edit the form
   */
  shouldShowRequiredIndicator(question: Question): boolean {
    return this._isRequired(question) && (this.doAssessment || this.isPendingReview);
  }
}
