import { environment } from '@v3/environments/environment';
import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, OnInit, QueryList, ViewChildren, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Assessment, Submission, AssessmentReview, AssessmentSubmitParams, Question, AssessmentService } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { BehaviorSubject, Observable, of, Subject, Subscription, throwError } from 'rxjs';
import { concatMap, delay, filter, takeUntil, tap } from 'rxjs/operators';
import { ActivityService } from '@v3/app/services/activity.service';

// const SAVE_PROGRESS_TIMEOUT = 10000; - AV2-1326
@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss'],
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
  @Input() action: string;
  @Input() assessment: Assessment = null;
  @Input() contextId: number;
  @Input() activityId?: number;
  @Input() submission: Submission;
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

  // used to resubscribe to the assessment service
  resubscribe$ = new Subject();
  // used to save the assessment/review answers
  submitActions = new Subject<{
    autoSave: boolean;
    goBack: boolean;
    questionSave?: {
      submissionId: number;
      questionId: number;
      answer: string;
    };
    reviewSave?: {
      reviewId: number;
      submissionId: number;
      questionId: number;
      answer: string;
      comment: string;
    };
  }>();
  subscriptions: Subscription[] = [];
  unsubscribe$ = new Subject();

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

  questionsForm: FormGroup;


  pageRequiredCompletion: boolean[] = []; // indicator for required questions

  @ViewChild('form') form: HTMLFormElement;
  @ViewChildren('questionBox') questionBoxes!: QueryList<{el: HTMLElement}>;

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

  pageSize = 8; // number of questions per page
  pageIndex = 0;

  // each entry is a page: an array of (partial) groups
  pagesGroups: { name: string; description?: string; questions: Question[] }[][] = [];

  // override to use question‑based pages
  get pageCount() {
    return this.pagesGroups.length;
  }

  get pagedGroups() {
    return this.pagesGroups[this.pageIndex] || [];
  }

  prevPage() {
    if (this.pageIndex > 0) { this.pageIndex--; }
  }

  nextPage() {
    if (this.pageIndex < this.pageCount - 1) { this.pageIndex++; }
  }

  get pages(): number[] {
    return Array(this.pageCount).fill(0).map((_, i) => i);
  }

  goToPage(i: number) {
    if (i >= 0 && i < this.pageCount) {
      this.pageIndex = i;
    }
  }

  ngOnInit(): void {
    this.subscribeSaveSubmission();
  }

  getQuestionBoxes() {
    return this.questionBoxes;
  }

  subscribeSaveSubmission() {
    this.submitActions.pipe(
      filter(() => !this._preventSubmission()), // skip when false
      concatMap(request => {
        if (request?.reviewSave) {
          return this.saveReviewAnswer(request.reviewSave);
        }
        if (request?.questionSave) {
          return this.saveQuestionAnswer(request.questionSave);
        }
        return of(request);
      }),
    ).subscribe(
      (data: {
        autoSave: boolean; // true: this request is for autosave; false: request is for submission (manual submission);
        goBack: boolean;
        questionSave?: {
          submissionId: number;
          questionId: number;
          answer: string;
        };
        error?: any;
      }): void | Promise<void> => {
        if (!this.utils.isEmpty(data.error)) {
          return this.notifications.assessmentSubmittedToast({
            isFail: true,
            label: $localize`Save failed. Please try again.`,
          });
        }

        if (data.autoSave === false) {
          return this._submitAnswer(data);
        }
      },
      // save/submission error handling http 500
      async (error) => {
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
    );
  }

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
    answer: string;
  }): Observable<any> {
    const answer = (!this.utils.isEmpty(questionInput.answer)) ? questionInput.answer : '';
    return this.assessmentService.saveQuestionAnswer(
      questionInput.submissionId,
      questionInput.questionId,
      answer,
    ).pipe(
      delay(800)
    );
  }

  saveReviewAnswer(questionInput: {
    reviewId: number;
    submissionId: number;
    questionId: number;
    answer: string;
    comment: string;
  }): Observable<any> {
    const answer = (!this.utils.isEmpty(questionInput.answer)) ? questionInput.answer : '';
    const comment = (!this.utils.isEmpty(questionInput.comment)) ? questionInput.comment : '';
    return this.assessmentService.saveReviewAnswer(
      questionInput.reviewId,
      questionInput.submissionId,
      questionInput.questionId,
      answer,
      comment,
    ).pipe(
      delay(800),
      tap((res) => { console.log(res) })
    );
  }

  ngOnChanges(): void {
    if (!this.assessment) {
      return;
    }

    this._initialise();
    this._populateQuestionsForm();
    this._handleSubmissionData();
    this._handleReviewData();
    this._preventSubmission();

    // split by question count every time assessment changes
    this.pagesGroups = this.splitGroupsByQuestionCount();
    this.pageIndex = 0;
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

  // Populate the question form with FormControls.
  // The name of form control is like 'q-2' (2 is an example of question id)
  private _populateQuestionsForm() {
    let validator = [];
    this.assessment.groups.forEach(group => {
      group.questions.forEach(question => {
        // check if the compulsory is mean for current user's role
        if (this._isRequired(question)) {
          // put 'required' validator in FormControl
          validator = [Validators.required];
        } else {
          validator = [];
        }

        this.questionsForm.addControl('q-' + question.id, new FormControl('', validator));
      });
    });

    this.questionsForm.valueChanges.subscribe((form) => {
      console.log('value changed', form);
      this.initializePageCompletion();
      this.btnDisabled$.next(this.questionsForm.invalid);
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
        this.savingMessage$.next($localize `Last saved ${this.utils.timeFormatter(this.submission.modified)}`);
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
    if (this.isPendingReview && this.review.status === 'in progress') {
      this.savingMessage$.next($localize `Last saved ${this.utils.timeFormatter(this.review.modified)}`);
      this.btnDisabled$.next(false);
    }
  }

  // make sure video is stopped when user leave the page
  ionViewWillLeave() {
    this.sharedService.stopPlayingVideos();
  }

  /**
   * a consistent comparison logic to ensure mandatory status
   * @param {question} question
   */
  private _isRequired(question) {
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
          if (this.utils.isEmpty(answered[question.id]) || this.utils.isEmpty(answered[question.id].answer)) {
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
        let answer;
        if (value) {
          answer = value;
        } else {
          this.assessment.groups.forEach(group => {
            const currentQuestion = group.questions.find(question => {
              return question.id === questionId;
            });
            if (currentQuestion && currentQuestion.type === 'multiple') {
              answer = [];
            } else {
              answer = null;
            }
          });
        }
        answers.push({
          questionId: questionId,
          answer: answer
        });
      });
    }

    // In review we also have comments for a question. and questionsForm value have both
    // answer and comment. need to add them as separately
    if (this.isPendingReview) {
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
        answers.push({
          questionId,
          answer: answer?.answer,
          comment: answer?.comment,
        });
      });
    }

    return answers;
  }

  async _submitAnswer({autoSave = false, goBack = false}) {
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
      if (this.submission.status == 'published' && !this.feedbackReviewed) {
        return 'readFeedback';
      }

      // condition: status not always = "Published", so we need to check by the submission status (completed = true means completed)
      if (this.submission.status == 'feedback available' && this.submission.completed === false) {
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
    this.pageRequiredCompletion = new Array(this.pageCount).fill(true);

    this.pages.forEach((page, index) => {
      const pageQuestions = this.getAllQuestionsForPage(index);
      this.pageRequiredCompletion[index] = this.areAllRequiredQuestionsAnswered(pageQuestions);
    });
  }

  private getAllQuestionsForPage(pageIndex: number): Question[] {
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
    // Get all questions for the current page
    const currentPageQuestions = this.getAllQuestionsForPage(this.pageIndex);

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
}
