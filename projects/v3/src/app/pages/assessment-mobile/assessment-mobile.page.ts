import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task } from '@v3/services/activity.service';
import { AssessmentService, Assessment } from '@v3/services/assessment.service';

@Component({
  selector: 'app-assessment-mobile',
  templateUrl: './assessment-mobile.page.html',
  styleUrls: ['./assessment-mobile.page.scss'],
})
export class AssessmentMobilePage implements OnInit {
  assessment$ = this.assessmentService.assessment$;
  submission$ = this.assessmentService.submission$;
  review$ = this.assessmentService.review$;

  assessment: Assessment;
  activityId: number;
  contextId: number;
  submissionId: number;
  action: string;

  currentTask: Task

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private activityService: ActivityService
  ) { }

  ngOnInit() {
    this.assessment$.subscribe(res => this.assessment = res);
    this.route.params.subscribe(params => {
      this.action = this.route.snapshot.data.action;
      this.activityId = +params.activityId;
      this.contextId = +params.contextId;
      this.submissionId = +params.submissionId;
      this.assessmentService.getAssessment(+params.id, this.action, this.activityId, this.contextId, this.submissionId);
    });
  }

  get task() {
    return {
      id: this.assessment.id,
      type: 'Assessment',
      name: this.assessment.name,
      status: ''
    };
  }

  async continue() {
    if (!this.currentTask) {
      this.currentTask = this.task;
    }
    if (this.currentTask.status === 'done') {
      // just go to the next task without any other action
      return this.activityService.goToNextTask(null, this.currentTask);
    }
    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(this.activityId, true, this.currentTask);
  }

  goBack() {
    this.router.navigate(['v3', 'activity-mobile', this.activityId]);
  }

  async saveAssessment(event) {
    await this.assessmentService.saveAnswers(event.assessment, event.answers, event.action, this.assessment.pulseCheck).subscribe();
    if (!event.assessment.inProgress) {
      // get the latest activity tasks and navigate to the next task
      return this.activityService.getActivity(this.activityId, true, this.task);
    }
  }

  async readFeedback(event) {
    await this.assessmentService.saveFeedbackReviewed(event).subscribe();
    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(this.activityId, true, this.task);
  }

  nextTask() {
    this.activityService.goToNextTask(null, this.task);
  }

}
