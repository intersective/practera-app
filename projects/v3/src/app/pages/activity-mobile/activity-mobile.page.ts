import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/services/activity.service';
import { AssessmentService, Submission } from '@v3/services/assessment.service';

@Component({
  selector: 'app-activity-mobile',
  templateUrl: './activity-mobile.page.html',
  styleUrls: ['./activity-mobile.page.scss'],
})
export class ActivityMobilePage implements OnInit {
  activity: Activity;
  submission: Submission;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private assessmentService: AssessmentService,
  ) { }

  ngOnInit() {
    this.activityService.activity$.subscribe(res => this.activity = res);
    this.assessmentService.submission$.subscribe(res => this.submission = res);
    this.route.params.subscribe(params => {
      this.activityService.getActivity(+params.id, false);
    });
  }

  goToTask(task: Task) {
    this.activityService.goToTask(task, false);
    switch (task.type) {
      case 'Assessment':
        this.router.navigate(['assessment-mobile', 'assessment', this.activity.id, task.contextId, task.id]);
        break;
      case 'Topic':
        this.router.navigate(['topic-mobile', this.activity.id, task.id]);
        break;
    }
  }

  goBack() {
    this.router.navigate(['v3', 'home']);
  }

}
