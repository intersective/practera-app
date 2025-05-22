import { AssessmentComponent } from './../../components/assessment/assessment.component';
import { UnlockIndicatorService } from './../../services/unlock-indicator.service';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/app/services/activity.service';
import { AssessmentReview, AssessmentService, Submission } from '@v3/app/services/assessment.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { Topic, TopicService } from '@v3/app/services/topic.service';
import { UtilsService } from '@v3/app/services/utils.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { delay, filter, tap, distinctUntilChanged, takeUntil, debounceTime } from 'rxjs/operators';
import { TopicComponent } from '@v3/app/components/topic/topic.component';
import { ComponentCleanupService } from '@v3/app/services/component-cleanup.service';
import { ReviewService } from '../../services/review.service';

const SAVE_PROGRESS_TIMEOUT = 10000;

@Component({
  selector: 'app-activity-desktop',
  templateUrl: './activity-desktop.page.html',
  styleUrls: ['./activity-desktop.page.scss'],
})
export class ActivityDesktopPage {
  activity: Activity;
  currentTask: Task;
  assessment = this.assessmentService.assessment$;
  submission: Submission;
  review: AssessmentReview;
  topic: Topic;
  loading: boolean;
  savingText$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  btnDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  notInATeamAndForTeamOnly: boolean = false;
  // loading overlay for assessment
  isLoadingAssessment: boolean = false;

  // grabs from URL parameter
  urlParams = {
    action: null,
    contextId: null,
  };
  scrolSubject = new BehaviorSubject(null);

  @ViewChild(AssessmentComponent) assessmentComponent!: AssessmentComponent;
  @ViewChild('scrollableTaskContent', { static: false }) scrollableTaskContent: {el: HTMLIonColElement};
  @ViewChild(TopicComponent) topicComponent: TopicComponent;

  // UI-purpose only variables
  flashesIndicated: { [key: string]: boolean } = {}; // prevent multiple flashes on the same question
  tooltipText: string;
  tooltipVisible: boolean;
  tooltipStyle: { top: string; right: string };
  activityLockShown: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private topicService: TopicService,
    private assessmentService: AssessmentService,
    private notificationsService: NotificationsService,
    private storageService: BrowserStorageService,
    private utils: UtilsService,
    private unlockIndicatorService: UnlockIndicatorService,
    private componentCleanupService: ComponentCleanupService,
    private reviewService: ReviewService,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
    // slow down the scroll event trigger
    this.scrolSubject
      .pipe(debounceTime(300))
      .pipe(takeUntil(this.componentCleanupService.cleanup$))
      .subscribe(() => this.flashHighlight());
  }

  /**
   * Flash highlight on the question box when it's in the viewport (task content ion-col)
   * @return  {void}  void
   */
  flashHighlight(): void {
    if (!this.assessmentComponent) {
      return;
    }

    const questionBoxes = this.assessmentComponent.getQuestionBoxes();
    questionBoxes
      .filter((questionBox) => {
        return questionBox.el.classList.contains('flash-highlight');
      })
      .forEach((questionBox: any) => {
        const rect = questionBox.el.getBoundingClientRect();
        if (
          !this.flashesIndicated[questionBox.el.id] &&
          rect.top >= 0 &&
          rect.bottom <= window.innerHeight
        ) {
          this.flashesIndicated[questionBox.el.id] = true;
          this.assessmentComponent.flashBlink(questionBox.el);
        }
      });
  }

  onScroll(): void {
    this.scrolSubject.next(null);
  }

  ionViewDidEnter() {
    // cleanup previous session
    this.componentCleanupService.triggerCleanup();

    this.activityService.activity$
      .pipe(
        filter((res) => res?.id === +this.route.snapshot.paramMap.get('id')),
        takeUntil(this.componentCleanupService.cleanup$)
      )
      .subscribe((res) => {
        this._setActivity(res);
      });

    this.activityService.currentTask$
      .pipe(
        // stop update currentTask if activity is locked
        filter(() => !this.activityLockShown),
        takeUntil(this.componentCleanupService.cleanup$)
      )
      .subscribe((res) => (this.currentTask = res));

    this.assessmentService.submission$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.componentCleanupService.cleanup$)
      )
      .subscribe((res) => (this.submission = res));

    this.assessmentService.review$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.componentCleanupService.cleanup$)
      ).subscribe((res) => (this.review = res));

    this.topicService.topic$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.componentCleanupService.cleanup$)
      ).subscribe((res) => (this.topic = res));

    this.route.paramMap.pipe(
      takeUntil(this.componentCleanupService.cleanup$)
    ).subscribe(params => {
      // from route
      const activityId = +params.get('id');
      // optional
      const contextId = +params.get('contextId');
      const assessmentId = +params.get('assessmentId');
      const topicId = +params.get('topicId');

      // directlink params (optional)
      const taskId: number = +params.get('task_id');
      const taskType: string = params.get('task') as
        | 'assessment'
        | 'topic'
        | null;
      const isTopicDirectlink = (taskType === 'topic' && taskId > 0) || topicId > 0;
      const directTaskId = (topicId > 0) ? topicId : taskId;

      // if assessmentId or taskId is provided, don't proceed to next task
      const proceedToNextTask = !(assessmentId > 0 || isTopicDirectlink);

      this.urlParams = {
        contextId: contextId,
        action: this.route.snapshot.data.action,
      };

      this.storageService.lastVisited('activityId', activityId);
      this.storageService.lastVisited('homeBookmarks', activityId);

      this.activityService.getActivity(
        activityId,
        proceedToNextTask,
        undefined,
        async (activity) => {
          // show current Assessment task (usually navigate from external URL, eg magiclink/notification/directlink)
          if (
            !proceedToNextTask &&
            (assessmentId > 0 || isTopicDirectlink === true)
          ) {
            const targetTask: Task = this.utils.find(this.activity.tasks, {
              id: assessmentId || directTaskId, // assessmentId or topicId/taskId
            });

            // if task is not found, show alert
            // if activity is locked, do nothing, as we are already showing the alert from:
            // 1. checkActivityLocked() method - for locked activity
            // 2. activityService.getActivity() - for missing activity
            if (!targetTask && this.activity.isLocked === false) {
              await this.notificationsService.alert({
                header: $localize`Task Not Found`,
                message: $localize`The task you are trying to access is not available. Please check back later or contact your coordinator for assistance.`,
              });
              return this.goBack();
            }

            if (targetTask) {
              this.goToTask({
                id: assessmentId || directTaskId,
                contextId: this.urlParams.contextId,
                type: targetTask.type,
                name: targetTask.name,
              });
            }
          }
        }
      );
    });

    // refresh when review is available (AI review, peer review, etc.)
    this.utils
      .getEvent('notification')
      .pipe(
        takeUntil(this.componentCleanupService.cleanup$)
      )
      .subscribe((event) => {
        const review = event?.meta?.AssessmentReview;
        if (
          event.type === 'assessment_review_published' &&
          review?.assessment_id
        ) {
          if (this.currentTask.id === review.assessment_id) {
            this.assessmentService.getAssessment(
              review.assessment_id,
              'assessment',
              review.activity_id,
              review.context_id
            );
          }
        }
      });

    // check new unlock indicator to refresh
    this.unlockIndicatorService.unlockedTasks$
      .pipe(takeUntil(this.componentCleanupService.cleanup$))
      .subscribe((unlockedTasks) => {
        if (this.activity) {
          if (
            unlockedTasks.some((task) => task.activityId === this.activity.id)
          ) {
            this.activityService.getActivity(this.activity.id);
          }
        }
      });
  }

  ionViewWillLeave() {
    this.topicService.clearTopic();
  }

  ionViewDidLeave() {
    this.assessmentService.clearAssessment();
  }

  // set activity data (avoid jumpy UI task list - CORE-6693)
  private _setActivity(res: Activity) {
    // check if activity is locked
    this.checkActivityLocked(res);

    if (
      this.activity !== undefined &&
      this.activity?.tasks.length === res.tasks.length
    ) {
      // Check if the tasks have changed (usually when a new task is unlocked/locked/reviewed)
      if (!this.utils.isEqual(this.activity?.tasks, res?.tasks)) {
        // Collect new tasks with id as key
        const newTasks = res.tasks.reduce((acc, task) => {
          if (task.id !== 0) {
            acc[task.id] = task;
          }
          return acc;
        }, {});

        const tasksToRemove = [];

        this.activity.tasks.forEach((task, index) => {
          if (task.id === 0) {
            // Locked/hidden task
            const newTask = res.tasks[index];
            if (newTask.id !== 0) {
              this.activity.tasks[index] = { ...task, ...newTask };
              tasksToRemove.push(index); // Mark this task for removal
            }
          } else if (
            newTasks[task.id] &&
            task.status !== newTasks[task.id]?.status
          ) {
            this.activity.tasks[index].status = newTasks[task.id].status;
          }
        });

        // Remove the locked tasks (id = 0) that were updated
        tasksToRemove.reverse().forEach((index) => {
          if (this.activity.tasks[index].id === 0) {
            this.activity.tasks.splice(index, 1);
          }
        });
      }
      return;
    }

    this.activity = res;
  }

  /**
   * checks if activity is locked and shows popup to inform user
   * @param activity activity object
   * @return  {Promise<void>}  void
   */
  private async checkActivityLocked(activity: Activity): Promise<void> {
    if (activity?.isLocked === true && !this.activityLockShown) {
      this.activityLockShown = true;
      await this.notificationsService.alert({
        header: $localize`Activity Locked`,
        message: $localize`This activity is currently locked and not available. Please check back later or contact your coordinator for assistance.`,
        backdropDismiss: false,
        buttons: [{
          text: $localize`OK`,
          handler: () => {
            this.activityLockShown = false;
            this.goBack();
          }
        }]
      });
    }
  }

  async goToTask(task: Task): Promise<any> {
    this.isLoadingAssessment = true;
    try {
      const taskContentElement = this.document.getElementById('task-content');
      if (taskContentElement) {
        taskContentElement.focus();
      }

      await this.activityService.goToTask(task);
      this.isLoadingAssessment = false;
    } catch (error) {
      this.isLoadingAssessment = false;
      console.error(error);
    }
  }

  async topicComplete(task: Task) {
    this.loading = true;
    this.btnDisabled$.next(true);
    if (task.status === 'done') {
      // just go to the next task without any other action (from topic)
      return this.activityService.goToNextTask(task, () => {
        this.loading = false;
        this.btnDisabled$.next(false);
      });
    }
    // mark the topic as complete
    await firstValueFrom(this.topicService
      .updateTopicProgress(task.id, 'completed'));

    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(
      this.activity.id,
      true,
      task,
      () => {
        this.loading = false;
        this.btnDisabled$.next(false);
      }
    );
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
      // handle unexpected submission: do final status check before saving
      let hasSubmssion = false;
      const { submission } = await this.assessmentService
        .fetchAssessment(
          event.assessmentId,
          'assessment',
          this.activity.id,
          event.contextId,
          event.submissionId
        )
        .toPromise();

      if (submission?.status === 'in progress') {
        const saved = await this.assessmentService
          .submitAssessment(
            event.submissionId,
            event.assessmentId,
            event.contextId,
            event.answers
          )
          .toPromise();

        // http 200 but error
        if (
          saved?.data?.submitAssessment?.success !== true ||
          this.utils.isEmpty(saved)
        ) {
          throw new Error('Error submitting assessment');
        }

        if (
          this.assessmentService.assessment?.pulseCheck === true &&
          event.autoSave === false
        ) {
          await this.assessmentService.pullFastFeedback();
        }
      } else {
        hasSubmssion = true;
      }

      this.savingText$.next(
        $localize`Last saved ${this.utils.getFormatedCurrentTime()}`
      );

      if (!event.autoSave) {
        if (hasSubmssion === true) {
          this.notificationsService.assessmentSubmittedToast({
            isDuplicated: true,
          });
        } else {
          this.notificationsService.assessmentSubmittedToast();
        }

        await firstValueFrom(this.assessmentService.fetchAssessment(
          event.assessmentId,
          'assessment',
          this.activity.id,
          event.contextId,
          event.submissionId
        ));

        // get the latest activity tasks
        return this.activityService.getActivity(
          this.activity.id,
          false,
          task,
          () => {
            this.loading = false;
            this.btnDisabled$.next(false);
          }
        );
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

  async readFeedback(submissionId, currentTask: Task) {
    try {
      this.loading = true;
      const savedReview = this.assessmentService.saveFeedbackReviewed(submissionId);
      await firstValueFrom(savedReview.pipe(
        // get the latest activity tasks and navigate to the next task
        // wait for a while for the server to save the "read feedback" status
        tap(() => this.activityService.getActivity(this.activity.id, true, currentTask)),
        delay(400)
      ));
      await this.reviewRatingPopUp();
      await this.notificationsService.getTodoItems().toPromise(); // update notifications list

      this.loading = false;
      this.btnDisabled$.next(false);
      return true;
    } catch (err) {
      console.error(err);
      this.loading = false;
      this.btnDisabled$.next(false);
    }
  }

  // Navigate to next task from the assessment component
  nextTask(task: Task) {
    this.loading = true;
    this.btnDisabled$.next(true);
    return this.activityService.goToNextTask(task, () => {
      this.loading = false;
      this.btnDisabled$.next(false);
    });
  }

  async reviewRatingPopUp(): Promise<void> {
    if (this.storageService.getUser().hasReviewRating === false) {
      return;
    }

    // display review rating modal
    return await this.reviewService.popUpReviewRating(
      this.review.id,
      false
    );
  }

  goBack() {
    this.currentTask = null;
    this.topicService.clearTopic();
    this.router.navigate(['v3', 'home']);
  }

  allTeamTasks(forTeamOnlyWarning: boolean) {
    this.notInATeamAndForTeamOnly = forTeamOnlyWarning;
  }

  // UI-purpose only functions (ion-fab-button actions)
  scrollTo(question) {
    const questionBoxes = this.assessmentComponent.getQuestionBoxById(`q-${question.id}`);
    const element = document.getElementById(`#q-${question}`) as HTMLElement;
    this.utils.scrollToElement(element || questionBoxes.el);
  }

  // Obtain the continuous index of the question (Question number)
  getContinuousIndex(groupIndex: number, questionIndex: number): number {
    const asmt = this.assessmentService.assessment;
    let totalQuestions = 0;
    for (let i = 0; i < groupIndex; i++) {
      totalQuestions += asmt.groups[i].questions.length;
    }
    return totalQuestions + questionIndex + 1;
  }

  // UI-purpose only functions (show tooltip)
  showTooltip(event, title: string) {
    this.tooltipText = title;
    this.tooltipVisible = true;
  }

  // UI-purpose only functions (hide tooltip)
  hideTooltip() {
    this.tooltipVisible = false;
  }

  // UI-purpose only functions (get total questions for decision of showing the ion-fab)
  totalQuestions(): number {
    return this.assessmentService.assessment?.groups.reduce(
      (acc, group) => acc + group.questions.length,
      0
    );
  }
}
