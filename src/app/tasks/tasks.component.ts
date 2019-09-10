import { Component, OnInit } from '@angular/core';
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
  constructor(
    public router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activityId = +this.route.snapshot.paramMap.get('id');
  }

  goto(event) {console.log(event);
    switch (event.type) {
      case 'topic':
        this.topicId = event.topicId;
        break;
      case 'assessment':
        this.assessmentId = event.assessmentId;
        this.contextId = event.contextId;
        break;
    }
  }

}
