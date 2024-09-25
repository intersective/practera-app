import { AssessmentComponent } from './../../components/assessment/assessment.component';
import { UnlockIndicatorService } from './../../services/unlock-indicator.service';
import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/app/services/activity.service';
import { AssessmentReview, AssessmentService, Submission } from '@v3/app/services/assessment.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { Topic, TopicService } from '@v3/app/services/topic.service';
import { UtilsService } from '@v3/app/services/utils.service';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { delay, filter, tap, distinctUntilChanged, takeUntil } from 'rxjs/operators';

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
  unsubscribe$ = new Subject();

  @ViewChild(AssessmentComponent) assessmentComponent!: AssessmentComponent;
  @ViewChild('scrollableTaskContent', { static: true }) scrollableTaskContent!: ElementRef;

  // UI-purpose only variables
  flahesIndicated: { [key: string]: boolean } = {}; // prevent multiple flashes on the same question

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
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
  }

  onScroll() {
    const questionBoxes = this.assessmentComponent.getQuestionBoxes();
    questionBoxes.filter(questionBox => {
      return questionBox.el.classList.contains('required');
    }).forEach((questionBox: any) => {
      const rect = questionBox.el.getBoundingClientRect();
      if (!this.flahesIndicated[questionBox.el.id] && rect.top >= 0 && rect.bottom <= window.innerHeight) {
        this.flahesIndicated[questionBox.el.id] = true;
        this.assessmentComponent.flashBlink(questionBox.el);
      }
    });
  }

  ionViewDidEnter() {
    this.activityService.activity$
      .pipe(
        filter((res) => res?.id === +this.route.snapshot.paramMap.get("id")),
        takeUntil(this.unsubscribe$),
      ).subscribe(res => this._setActivity(res));

    this.activityService.currentTask$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => this.currentTask = res);

      /* this.assessmentService.assessment$
        .pipe(
          distinctUntilChanged(),
          takeUntil(this.unsubscribe$),
        ).subscribe((res) => (this.assessment = res)); */

      this.assessmentService.submission$
        .pipe(
          distinctUntilChanged(),
          takeUntil(this.unsubscribe$),
        )
        .subscribe((res) => (this.submission = res));

      this.assessmentService.review$
        .pipe(
          distinctUntilChanged(),
          takeUntil(this.unsubscribe$),
        ).subscribe((res) => (this.review = res));

      this.topicService.topic$
        .pipe(
          distinctUntilChanged(),
          takeUntil(this.unsubscribe$),
        ).subscribe((res) => (this.topic = res));

    this.route.paramMap.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(params => {
      // from route
      const activityId = +params.get('id');
      const contextId = +params.get('contextId'); // optional
      const assessmentId = +params.get('assessmentId');  // optional

      // directlink params (optional)
      const taskId: number = +params.get('task_id');
      const taskType: string = params.get('task') as 'assessment' | 'topic' | null;
      const isTopicDirectlink = taskType === 'topic' && taskId > 0;

      // if assessmentId or taskId is provided, don't proceed to next task
      const proceedToNextTask = !(assessmentId > 0 || isTopicDirectlink);

      this.urlParams = {
        contextId: contextId,
        action: this.route.snapshot.data.action,
      };

      this.activityService.getActivity(activityId, proceedToNextTask, undefined, async (data) => {
        // show current Assessment task (usually navigate from external URL, eg magiclink/notification/directlink)
        if (!proceedToNextTask && (assessmentId > 0 || isTopicDirectlink === true)) {
          const filtered: Task = this.utils.find(this.activity.tasks, {
            id: assessmentId || taskId,  // assessmentId or taskId
          });

          // if API not returning any related activity, handle bad API response gracefully
          if (filtered === undefined) {
            await this.notificationsService.alert({
              header: $localize`Activity not found`,
              message: $localize`The activity you are looking for is not found or hasn't been unlocked for your access yet.`,
            });
            return this.goBack();
          }

          this.goToTask({
            id: assessmentId || taskId,
            contextId: this.urlParams.contextId,
            type: filtered.type,
            name: filtered.name
          });
        }
      });
    });

    // refresh when review is available (AI review, peer review, etc.)
    this.utils.getEvent('notification')
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(event => {
      const review = event?.meta?.AssessmentReview;
      if (event.type === 'assessment_review_published' && review?.assessment_id) {
        if (this.currentTask.id === review.assessment_id) {
          this.assessmentService.getAssessment(review.assessment_id, 'assessment', review.activity_id, review.context_id);
        }
      }
    });

    // check new unlock indicator to refresh
    this.unlockIndicatorService.unlockedTasks$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(unlockedTasks => {
      if (this.activity) {
        if (unlockedTasks.some(task => task.activityId === this.activity.id)) {
          this.activityService.getActivity(this.activity.id);
        }
      }
    });
  }

  ionViewWillLeave() {
    this.topicService.clearTopic();
  }

  ionViewDidLeave() {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
    this.assessmentService.clearAssessment();
  }

  // set activity data (avoid jumpy UI task list - CORE-6693)
  private _setActivity(res: Activity) {
    if (this.activity !== undefined && this.activity?.tasks.length === res.tasks.length) {
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
          if (task.id === 0) {  // Locked/hidden task
            const newTask = res.tasks[index];
            if (newTask.id !== 0) {
              this.activity.tasks[index] = { ...task, ...newTask };
              tasksToRemove.push(index); // Mark this task for removal
            }
          } else if (newTasks[task.id] && task.status !== newTasks[task.id]?.status) {
            this.activity.tasks[index].status = newTasks[task.id].status;
          }
        });

        // Remove the locked tasks (id = 0) that were updated
        tasksToRemove.reverse().forEach(index => {
          if (this.activity.tasks[index].id === 0) {
            this.activity.tasks.splice(index, 1);
          }
        });
      }
      return;
    }

    this.activity = res;
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
    await this.topicService.updateTopicProgress(task.id, 'completed').toPromise();

    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(this.activity.id, true, task, () => {
      this.loading = false;
      this.btnDisabled$.next(false);
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
      // handle unexpected submission: do final status check before saving
      let hasSubmssion = false;
      const { submission } = await this.assessmentService
        .fetchAssessment(
          event.assessmentId,
          "assessment",
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
          throw new Error("Error submitting assessment");
        }

        if (this.assessmentService.assessment?.pulseCheck === true && event.autoSave === false) {
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
          this.notificationsService.assessmentSubmittedToast({ isDuplicated: true });
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
        return this.activityService.getActivity(this.activity.id, false, task, () => {
          this.loading = false;
          this.btnDisabled$.next(false);
        });
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
      await savedReview.pipe(
        // get the latest activity tasks and navigate to the next task
        // wait for a while for the server to save the "read feedback" status
        tap(() => this.activityService.getActivity(this.activity.id, true, currentTask)),
        delay(400)
      ).toPromise();
      await this.reviewRatingPopUp();
      await this.notificationsService.getTodoItems().toPromise(); // update notifications list

      this.loading = false;
      this.btnDisabled$.next(false);
      return true;
    } catch(err) {
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
    return await this.notificationsService.popUpReviewRating(this.review.id, false);
  }

  goBack() {
    this.currentTask = null;
    this.topicService.clearTopic();
    this.router.navigate(['v3', 'home']);
  }

  allTeamTasks(forTeamOnlyWarning: boolean) {
    this.notInATeamAndForTeamOnly = forTeamOnlyWarning;
  }
}
