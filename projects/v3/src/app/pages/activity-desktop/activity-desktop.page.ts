import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/app/services/activity.service';
import { Assessment, AssessmentReview, AssessmentService, Submission } from '@v3/app/services/assessment.service';
import { Topic, TopicService } from '@v3/app/services/topic.service';

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

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private topicService: TopicService,
    private assessmentService: AssessmentService
  ) { }

  ngOnInit() {
    this.activityService.activity$.subscribe(res => this.activity = res);
    this.activityService.currentTask$.subscribe(res => this.currentTask = res);
    this.assessmentService.assessment$.subscribe(res => this.assessment = res);
    this.assessmentService.submission$.subscribe(res => this.submission = res);
    this.assessmentService.review$.subscribe(res => this.review = res);
    this.topicService.topic$.subscribe(res => this.topic = res);
    this.route.params.subscribe(params => {
      this.activityService.getActivity(+params.id, true);
    });
  }

  goToTask(task: Task) {
    this.activityService.goToTask(task);
  }

  async topicComplete(task: Task) {
    if (task.status === 'done') {
      // just go to the next task without any other action
      return this.activityService.goToNextTask(this.activity.tasks, task);
    }
    // mark the topic as complete
    await this.topicService.updateTopicProgress(task.id, 'completed').subscribe();
    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(this.activity.id, true, task);
  }

  async saveAssessment(event, task: Task) {
    await this.assessmentService.saveAnswers(event.assessment, event.answers, event.action, this.assessment.pulseCheck).toPromise();
    if (!event.assessment.inProgress) {
      // get the latest activity tasks and navigate to the next task
      return this.activityService.getActivity(this.activity.id, true, task);
    }
  }

  async readFeedback(event, task: Task) {
    await this.assessmentService.saveFeedbackReviewed(event).subscribe();
    setTimeout(
      // get the latest activity tasks and navigate to the next task
      // wait for a while for the server to save the "read feedback" status
      () => this.activityService.getActivity(this.activity.id, true, task),
      500
    )
    return true;
  }

  nextTask(task: Task) {
    this.activityService.goToNextTask(this.activity.tasks, task);
  }

}
