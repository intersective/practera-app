import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent extends RouterEnter {
  routeUrl = '/app/activity';
  activityId: number;
  topicId: number;
  assessmentId: number;
  contextId: number;
  @ViewChild('activity') activity;
  @ViewChild('topic') topic;
  @ViewChild('assessment') assessment;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public utils: UtilsService
  ) {
    super(router);
  }

  onEnter() {
    this.activityId = +this.route.snapshot.paramMap.get('id');
    // trigger onEnter after the element get generated
    setTimeout(() => {
      this.activity.onEnter();
    });
  }

  goto(event) {
    switch (event.type) {
      case 'topic':
        this.topicId = event.topicId;
        // hide the assessment component
        this.assessmentId = null;
        // trigger onEnter after the element get generated
        setTimeout(() => {
          this.topic.onEnter();
        });
        break;
      case 'assessment':
        this.assessmentId = event.assessmentId;
        this.contextId = event.contextId;
        // hide the topic component
        this.topicId = null;
        // trigger onEnter after the element get generated
        setTimeout(() => {
          this.assessment.onEnter();
        });
        break;
    }
  }

}
