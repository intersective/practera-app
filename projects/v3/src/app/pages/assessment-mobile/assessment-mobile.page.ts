import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task } from '@v3/app/services/activity.service';
import { AssessmentService, Assessment } from '@v3/app/services/assessment.service';

@Component({
  selector: 'app-assessment-mobile',
  templateUrl: './assessment-mobile.page.html',
  styleUrls: ['./assessment-mobile.page.scss'],
})
export class AssessmentMobilePage implements OnInit {
  assessment$ = this.assessmentService.assessment$;

  assessment: Assessment;
  activityId: number;
  currentTask: Task

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private activityService: ActivityService
  ) { }

  ngOnInit() {
    this.assessment$.subscribe(res => this.assessment = res);
    this.activityService.currentTask$.subscribe(res => this.currentTask = res);
    this.route.params.subscribe(params => {
      this.assessmentService.getAssessment(params.id);
      this.activityId = params.activityId;
    });
  }

  async continue() {
    if (!this.currentTask) {
      this.currentTask = {
        id: this.assessment.id,
        type: 'Assessment',
        name: this.assessment.title,
        status: ''
      };
    }
    if (this.currentTask.status === 'done') {
      // just go to the next task without any other action
      return this.activityService.goToNextTask(null, this.currentTask);
    }
    // mark the assessment as completer
    await this.assessmentService.updateAssessmentProgress(this.assessment.id, 'completed').subscribe();
    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(this.activityId, true, this.currentTask);
  }

  goBack() {
    this.router.navigate(['v3', 'activity-mobile', this.activityId]);
  }

}
