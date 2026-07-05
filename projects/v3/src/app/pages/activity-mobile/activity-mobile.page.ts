import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/services/activity.service';
import { AssessmentService, Submission } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { filter } from 'rxjs/operators';

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
    private utils: UtilsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    this.activityService.activity$
      .pipe(filter(res => res?.id === +this.route.snapshot.paramMap.get('id')))
      .subscribe(res => {
        this.ngZone.run(() => {
          this.activity = res;
          this.cdr.markForCheck();
        });
        if (res?.name) {
          this.utils.setPageTitle(`${res.name} - Practera`);
        }
      });
    this.assessmentService.submission$.subscribe(res => {
      this.ngZone.run(() => {
        this.submission = res;
        this.cdr.markForCheck();
      });
    });
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
