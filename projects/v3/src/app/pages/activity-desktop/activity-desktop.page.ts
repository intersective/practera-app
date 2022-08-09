import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/app/services/activity.service';
import { Assessment, AssessmentReview, AssessmentService, Submission } from '@v3/app/services/assessment.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { Topic, TopicService } from '@v3/app/services/topic.service';
import { UtilsService } from '@v3/app/services/utils.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-activity-desktop',
  templateUrl: './activity-desktop.page.html',
  styleUrls: ['./activity-desktop.page.scss'],
})
export class ActivityDesktopPage implements OnInit {
  activity: Activity;
  currentTask: Task;
  assessment: Assessment;
  submission: Submission;
  review: AssessmentReview;
  topic: Topic;
  loading: boolean;
  savingText$: BehaviorSubject<string> = new BehaviorSubject<string>('');

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

  ngOnInit() {
    this.activityService.activity$.subscribe(res => this.activity = res);
    this.activityService.currentTask$.subscribe(res => this.currentTask = res);
    this.assessmentService.assessment$.subscribe(res => this.assessment = res);
    this.assessmentService.submission$.subscribe(res => this.submission = res);
    this.assessmentService.review$.subscribe(res => this.review = res);
    this.topicService.topic$.subscribe(res => this.topic = res);

    this.route.paramMap.subscribe(params => {
      const contextId = +params.get('contextId');
      const activityId = +params.get('id');
      const assessmentId = +params.get('assessmentId');

      const proceedToNextTask = assessmentId > 0 ? false : true;
      this.urlParams = {
        contextId: contextId,
        action: this.route.snapshot.data.action,
      };

      this.activityService.getActivity(activityId, proceedToNextTask, undefined, () => {
        // show current Assessment task (usually navigate from external URL, eg magiclink/notification/directlink)
        if (!proceedToNextTask && assessmentId > 0) {
          const filtered: Task = this.utils.find(this.activity.tasks, {
            id: assessmentId
          });
          this.goToTask({
            id: assessmentId,
            contextId: this.urlParams.contextId,
            type: filtered.type,
            name: filtered.name
          });
        }
      });
    });
  }

  goToTask(task: Task) {
    this.document.getElementById('task-content').focus();
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

  async saveAssessment(event, task: Task) {
    this.loading = true;
    this.savingText$.next('Saving...');
    await this.assessmentService.saveAnswers(event.assessment, event.answers, event.action, this.assessment.pulseCheck).toPromise();
    this.savingText$.next('Last saved ' + this.utils.getFormatedCurrentTime());
    if (!event.assessment.inProgress) {
      this.notificationsService.assessmentSubmittedToast();
      // get the latest activity tasks and navigate to the next task
      this.activityService.getActivity(this.activity.id, false, task, () => {
        this.loading = false;
      });
      return this.assessmentService.getAssessment(event.assessment.id, 'assessment', this.activity.id, event.assessment.contextId, event.assessment.submissionId);
    } else {
      this.loading = false;
    }
  }

  async readFeedback(event, task: Task) {
    await this.assessmentService.saveFeedbackReviewed(event).toPromise();
    setTimeout(
      // get the latest activity tasks and navigate to the next task
      // wait for a while for the server to save the "read feedback" status
      () => this.activityService.getActivity(this.activity.id, true, task),
      500
    );
    await this.reviewRatingPopUp();
    return true;
  }

  nextTask(task: Task) {
    this.activityService.goToNextTask(this.activity.tasks, task);
  }

  async reviewRatingPopUp(): Promise<void> {
    if (this.storageService.getUser().hasReviewRating === false) {
      return;
    }

    try {
      // display review rating modal
      return await this.assessmentService.popUpReviewRating(this.review.id, false);
    } catch (err) {
      const header = 'Can not get review rating information';
      await this.notificationsService.alert({
        header,
        message: err.msg || JSON.stringify(err)
      });
      throw new Error(err);
    }
  }

  goBack() {
    this.router.navigate(['v3', 'home']);
  }
}
