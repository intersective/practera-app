import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/app/services/activity.service';
import { Assessment, AssessmentReview, AssessmentService, Submission } from '@v3/app/services/assessment.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { Topic, TopicService } from '@v3/app/services/topic.service';
import { UtilsService } from '@v3/app/services/utils.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

const SAVE_PROGRESS_TIMEOUT = 10000;

@Component({
  selector: 'app-activity-desktop',
  templateUrl: './activity-desktop.page.html',
  styleUrls: ['./activity-desktop.page.scss'],
})
export class ActivityDesktopPage {
  subscriptions: Subscription[] = [];
  activity: Activity;
  currentTask: Task;
  assessment: Assessment;
  submission: Submission;
  review: AssessmentReview;
  topic: Topic;
  loading: boolean;
  savingText$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  btnDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // grabs from URL parameter
  urlParams = {
    action: null,
    contextId: null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private topicService: TopicService,
    private assessmentService: AssessmentService,
    private notificationsService: NotificationsService,
    private storageService: BrowserStorageService,
    private utils: UtilsService,
    @Inject(DOCUMENT) private readonly document: Document
  ) { }

  ionViewWillEnter() {
    this.subscriptions.push(
      this.activityService.activity$.subscribe(res => this.activity = res)
    );
    this.subscriptions.push(
      this.activityService.currentTask$.subscribe(res => this.currentTask = res)
    );
    this.subscriptions.push(
      this.assessmentService.assessment$.subscribe(res => this.assessment = res)
    );
    this.subscriptions.push(
      this.assessmentService.submission$.subscribe(res => this.submission = res)
    );
    this.subscriptions.push(
      this.assessmentService.review$.subscribe(res => this.review = res)
    );
    this.subscriptions.push(
      this.topicService.topic$.subscribe(res => this.topic = res)
    );

    this.subscriptions.push(this.route.paramMap.subscribe(params => {
      const contextId = +params.get('contextId');
      const activityId = +params.get('id');
      const assessmentId = +params.get('assessmentId');

      const proceedToNextTask = assessmentId > 0 ? false : true;
      this.urlParams = {
        contextId: contextId,
        action: this.route.snapshot.data.action,
      };

      this.activityService.getActivity(activityId, proceedToNextTask, undefined, async () => {
        // show current Assessment task (usually navigate from external URL, eg magiclink/notification/directlink)
        if (!proceedToNextTask && assessmentId > 0) {
          const filtered: Task = this.utils.find(this.activity.tasks, {
            id: assessmentId
          });

          // if API not returning any related activity, handle bad API response gracefully
          if (filtered === undefined) {
            await this.notificationsService.alert({
              header: $localize`Activity not found`,
              message: $localize`The activity you are looking for is not found or haven't been unlocked for your access yet.`,
            });
            return this.goBack();
          }

          this.goToTask({
            id: assessmentId,
            contextId: this.urlParams.contextId,
            type: filtered.type,
            name: filtered.name
          });
        }
      });
    }));
  }

  ionViewDidLeave() {
    this.subscriptions.forEach(sub => {
      if (sub.closed !== true) {
        sub.unsubscribe();
      }
    });
  }

  async goToTask(task: Task): Promise<any> {
    const taskContentElement = this.document.getElementById('task-content');
    if (taskContentElement) {
      taskContentElement.focus();
    }

    return this.activityService.goToTask(task);
  }

  async topicComplete(task: Task) {
    if (task.status === 'done') {
      // just go to the next task without any other action
      return this.activityService.goToNextTask(this.activity.tasks, task);
    }
    // mark the topic as complete
    this.loading = true;
    await this.topicService.updateTopicProgress(task.id, 'completed').toPromise();
    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(this.activity.id, true, task, () => {
      this.loading = false;
    });
  }

  /**
   * Save the assessment
   *
   * @param   {}event  save event emitted from the assessment component
   * @param   {Task}  task   the current task
   *
   * @return  {any}
   */
  async saveAssessment(event, task: Task) {
    // autoSave must be false to fire submit assessment API request
    // loading is mainly for cosmetic purpose
    // below if-statement is made to prevent double submission
    // condition: autoSave = true & loading = true
    if (event.autoSave && this.loading) {
      return;
    }

    this.loading = true;
    this.btnDisabled$.next(true);
    this.savingText$.next('Saving...');
    try {
      const saved = await this.assessmentService.submitAssessment(
        event.submissionId,
        event.assessmentId,
        event.contextId,
        event.answers
      ).toPromise();

      // http 200 but error
      if (saved?.data?.submitAssessment?.success !== true || this.utils.isEmpty(saved)) {
        throw new Error("Error submitting assessment");
      }

      if (this.assessment.pulseCheck === true && event.autoSave === false) {
        await this.assessmentService.pullFastFeedback();
      }

      this.savingText$.next($localize `Last saved ${this.utils.getFormatedCurrentTime()}`);
      if (!event.autoSave) {
        this.notificationsService.assessmentSubmittedToast();
        // get the latest activity tasks and navigate to the next task
        this.activityService.getActivity(this.activity.id, false, task, () => {
          this.loading = false;
          this.btnDisabled$.next(false);
        });
        return this.assessmentService.getAssessment(event.assessmentId, 'assessment', this.activity.id, event.contextId, event.submissionId);
      } else {
        setTimeout(() => {
          this.btnDisabled$.next(false);
          this.loading = false;
        }, SAVE_PROGRESS_TIMEOUT);
      }
    } catch (error) {
      this.loading = false;
      this.btnDisabled$.next(false);
      this.savingText$.next('');
      this.notificationsService.assessmentSubmittedToast({ isFail: true });
    }
  }

  async readFeedback(submissionId, task: Task) {
    try {
      this.loading = true;
      const savedReview = this.assessmentService.saveFeedbackReviewed(submissionId);
      await savedReview.pipe(
        // get the latest activity tasks and navigate to the next task
        // wait for a while for the server to save the "read feedback" status
        tap(() => this.activityService.getActivity(this.activity.id, true, task)),
        delay(400)
      ).toPromise();
      await this.reviewRatingPopUp();

      this.loading = false;
      this.btnDisabled$.next(false);
      return true;
    } catch(err) {
      console.error(err);
      this.loading = false;
      this.btnDisabled$.next(false);
    }
  }

  nextTask(task: Task) {
    this.activityService.goToNextTask(this.activity.tasks, task);
  }

  async reviewRatingPopUp(): Promise<void> {
    if (this.storageService.getUser().hasReviewRating === false) {
      return;
    }

    // display review rating modal
    return await this.notificationsService.popUpReviewRating(this.review.id, false);
  }

  goBack() {
    this.router.navigate(['v3', 'home']);
  }
}
