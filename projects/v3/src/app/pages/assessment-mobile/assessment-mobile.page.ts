import { debounce } from 'lodash';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { ActivityService, Task } from '@v3/services/activity.service';
import { AssessmentService, Assessment, Submission, AssessmentReview } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/app/services/utils.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { ReviewService } from '@v3/app/services/review.service';
import { AssessmentComponent } from '@v3/app/components/assessment/assessment.component';
import { debounceTime } from 'rxjs/operators';

const SAVE_PROGRESS_TIMEOUT = 10000;

@Component({
  selector: 'app-assessment-mobile',
  templateUrl: './assessment-mobile.page.html',
  styleUrls: ['./assessment-mobile.page.scss'],
})
export class AssessmentMobilePage implements OnInit {
  assessment: Assessment;
  submission: Submission;
  review: AssessmentReview;
  activityId: number;
  contextId: number;
  submissionId: number;
  action: string;
  fromPage: string;
  savingText$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  btnDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  saving: boolean;

  currentTask: Task;

  @ViewChild(AssessmentComponent) assessmentComponent!: AssessmentComponent;
  flashIndicators: { [key: string]: boolean } = {};
  scrollSubject: Subject<null> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private activityService: ActivityService,
    private readonly storageService: BrowserStorageService,
    private notificationsService: NotificationsService,
    private readonly utils: UtilsService,
    private reviewService: ReviewService,
  ) {
    this.scrollSubject
    .pipe(debounceTime(300))
    .subscribe(() => this.flashHighlight());
  }

  flashHighlight(): void {
    const questionBoxes = this.assessmentComponent.getQuestionBoxes();
    questionBoxes.filter(questionBox => {
      return questionBox.el.classList.contains('flash-highlight');
    }).forEach((questionBox: any) => {
      const rect = questionBox.el.getBoundingClientRect();
      if (!this.flashIndicators[questionBox.el.id] && rect.top >= 0 && rect.bottom <= window.innerHeight) {
        this.flashIndicators[questionBox.el.id] = true;
        this.assessmentComponent.flashBlink(questionBox.el);
      }
    });
  }

  ngOnInit() {
    this.assessmentService.assessment$.subscribe(res => {
      this.assessment = res;
      this.utils.setPageTitle(this.assessment?.name);
    });
    this.assessmentService.submission$.subscribe(res => {
      this.submission = res;
    });
    this.assessmentService.review$.subscribe(res => this.review = res);
    this.route.params.subscribe(params => {
      const assessmentId = +params.id;
      this.action = this.route.snapshot.data.action;
      this.fromPage = this.route.snapshot.data.from;
      if (!this.fromPage) {
        this.fromPage = this.route.snapshot.paramMap.get('from');
      }
      this.activityId = +params.activityId || 0; // during review session, activityId is not required, set to 0
      this.contextId = +params.contextId;
      this.submissionId = +params.submissionId;
      this.assessmentService.getAssessment(assessmentId, this.action, this.activityId, this.contextId, this.submissionId);
    });
  }

  get restrictedAccess() {
    return this.storageService.singlePageAccess;
  }

  get task() {
    return {
      id: this.assessment.id,
      type: 'Assessment',
      name: this.assessment.name,
      status: ''
    };
  }

  onScroll() {
    this.scrollSubject.next();
  }

  goBack() {
    if (this.fromPage === 'reviews') {
      return this.router.navigate(['v3', 'reviews']);
    }
    if (!this.activityId) {
      return this.router.navigate(['v3', 'home']);
    }
    return this.router.navigate(['v3', 'activity-mobile', this.activityId]);
  }

  async saveAssessment(event) {
    if (event.autoSave && this.saving) {
      return;
    }

    this.saving = true;
    this.btnDisabled$.next(true);
    this.savingText$.next('Saving...');

    try {
      let hasSubmission = false;
      const { submission } = await this.assessmentService.fetchAssessment(
        event.assessmentId,
        this.action,
        this.activityId,
        event.contextId,
        event.submissionId,
      ).toPromise();

      if (this.action === 'assessment' && submission.status === 'in progress') {
        const saved = await this.assessmentService.submitAssessment(
          event.submissionId,
          event.assessmentId,
          event.contextId,
          event.answers
        ).toPromise();

        // http 200 but error
        if (saved?.data?.submitAssessment?.success !== true || this.utils.isEmpty(saved)) {
          console.error('Asmt submission error:', saved);
          throw new Error("Error submitting assessment");
        }
      } else if (this.action === 'review' && submission.status === 'pending review') {
        const saved = await this.assessmentService.submitReview(
          event.assessmentId,
          this.review.id,
          event.submissionId,
          event.answers
        ).toPromise();

        // http 200 but error
        if (saved?.data?.submitReview?.success !== true || this.utils.isEmpty(saved)) {
          console.error('Review submission error:', saved);
          throw new Error("Error submitting review.");
        }

        this.reviewService.getReviews();
      } else {
        hasSubmission = true;
      }

      // [CORE-5876] - Fastfeedback is now added for reviewer
      if (this.assessment.pulseCheck === true && event.autoSave === false) {
        await this.assessmentService.pullFastFeedback();
      }

      this.savingText$.next($localize `Last saved ${this.utils.getFormatedCurrentTime()}`);
      if (!event.autoSave) {
        // show toast message
        if (hasSubmission === true) {
          this.notificationsService.assessmentSubmittedToast({ isDuplicated: true });
        } else {
          this.notificationsService.assessmentSubmittedToast({ isReview: this.action === 'review'});
        }

        await this.assessmentService.fetchAssessment(
          this.assessment.id,
          this.action,
          this.activityId,
          this.contextId,
          this.submissionId
        ).toPromise();

        if (this.action === 'assessment') {
          // get the latest activity tasks and refresh the assessment submission data
          this.activityService.getActivity(this.activityId, false, null, () => {
            this.btnDisabled$.next(false);
          });
        } else {
          this.btnDisabled$.next(false);
          this.saving = false;
        }
      } else {
        setTimeout(() => {
          this.btnDisabled$.next(false);
          this.saving = false;
        }, SAVE_PROGRESS_TIMEOUT);
      }
    } catch (err) {
      this.btnDisabled$.next(false);
      this.saving = false;
      this.notificationsService.assessmentSubmittedToast({isFail: true});
    }
  }

  async readFeedback(event) {
    try {
      await this.assessmentService.saveFeedbackReviewed(event).toPromise();
      await this.reviewRatingPopUp();
      await this.notificationsService.getTodoItems().toPromise(); // update notifications list

      // get the latest activity tasks and navigate to the next task
      return this.activityService.getActivity(this.activityId, true, this.task, () => {
        this.btnDisabled$.next(false);
      });
    } catch(err) {
      this.btnDisabled$.next(false);
      console.error(err);
    }
  }

  nextTask() {
    return this.activityService.getActivity(this.activityId, true, this.task);
  }

  async reviewRatingPopUp(): Promise<void> {
    if (this.storageService.getUser().hasReviewRating === false) {
      return;
    }

    try {
      // display review rating modal
      return await this.notificationsService.popUpReviewRating(this.review.id, false);
    } catch (err) {
      const header = $localize`Can not get review rating information`;
      await this.notificationsService.alert({
        header,
        message: err.msg || JSON.stringify(err)
      });
      throw new Error(err);
    }
  }
}
