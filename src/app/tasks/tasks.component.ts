import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
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
  ) { }

  ngOnInit() {
    this.activityId = +this.route.snapshot.paramMap.get('id');
  }
  ngAfterViewInit() {
    this.activity.onEnter();
  }

  goto(event) {
    switch (event.type) {
      case 'topic':
        this.topicId = event.topicId;
        this.assessmentId = null;
        // trigger onEnter after the element get generated
        setTimeout(() => {
          this.topic.onEnter();
        });
        break;
      case 'assessment':
        this.assessmentId = event.assessmentId;
        this.contextId = event.contextId;
        this.topicId = null;
        // trigger onEnter after the element get generated
        setTimeout(() => {
          this.assessment.onEnter();
        });
        break;
    }
  }

}
