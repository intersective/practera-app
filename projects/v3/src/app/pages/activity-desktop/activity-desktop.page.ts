import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityService, Task } from '@v3/app/services/activity.service';

@Component({
  selector: 'app-activity-desktop',
  templateUrl: './activity-desktop.page.html',
  styleUrls: ['./activity-desktop.page.scss'],
})
export class ActivityDesktopPage implements OnInit {
  activity$ = this.service.activity$;
  currentTask: Task;

  constructor(
    private route: ActivatedRoute,
    private service: ActivityService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.service.getActivity(params.id);
    });
  }

}
