import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/services/activity.service';
import { AssessmentService, Submission } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { filter } from 'rxjs/operators';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { NotificationsService } from '@v3/app/services/notifications.service';

@Component({
  standalone: false,
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
    private unlockIndicatorService: UnlockIndicatorService,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
  ) { }

  ngOnInit() {
    this.activityService.activity$
      .pipe(filter(res => res?.id === +this.route.snapshot.paramMap.get('id')))
      .subscribe(res => {
        this.activity = res;
        if (res?.id) {
          this.clearPureActivityIndicator(res.id);
        }
        if (res?.name) {
          this.utils.setPageTitle(`${res.name} - Practera`);
        }
      });
    this.assessmentService.submission$.subscribe(res => this.submission = res);
    this.route.params.subscribe(params => {
      this.activityService.getActivity(+params.id, false);
    });
  }

  /**
   * Clear activity-level-only unlock indicators when entering the activity page.
   */
  private clearPureActivityIndicator(activityId: number) {
    if (!activityId) { return; }

    try {
      // First try the standard approach
      const entries = this.unlockIndicatorService.getTasksByActivityId(activityId);
      if (entries?.length > 0 && entries.every(e => e.taskId === undefined)) {
        const cleared = this.unlockIndicatorService.clearByActivityId(activityId);
        cleared?.forEach(todo => this.notificationsService.markTodoItemAsDone(todo).subscribe());
        return;
      }

      // If standard approach didn't find anything, try robust clearing for inaccurate data
      const relatedIndicators = this.unlockIndicatorService.findRelatedIndicators('activity', activityId);
      if (relatedIndicators?.length > 0) {
        // Only clear if they are pure activity-level (no task-specific entries)
        const pureActivityIndicators = relatedIndicators.filter(r => r.taskId === undefined);
        if (pureActivityIndicators.length > 0) {
          const cleared = this.unlockIndicatorService.clearRelatedIndicators('activity', activityId);
          cleared?.forEach(todo => this.notificationsService.markTodoItemAsDone(todo).subscribe());
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug('[unlock-indicator] cleanup skipped for activity', activityId, e);
    }
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
