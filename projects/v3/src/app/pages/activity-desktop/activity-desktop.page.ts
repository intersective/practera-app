import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/app/services/activity.service';
import { AssessmentService } from '@v3/app/services/assessment.service';
import { Topic, TopicService } from '@v3/app/services/topic.service';

@Component({
  selector: 'app-activity-desktop',
  templateUrl: './activity-desktop.page.html',
  styleUrls: ['./activity-desktop.page.scss'],
})
export class ActivityDesktopPage implements OnInit {
  activity$ = this.activityService.activity$;
  currentTask$ = this.activityService.currentTask$;
  topic$ = this.topicService.topic$;
  assessment$ = this.assessmentService.assessment$;
  submission$ = this.assessmentService.submission$;
  review$ = this.assessmentService.review$;

  activity: Activity;

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private topicService: TopicService,
    private assessmentService: AssessmentService
  ) { }

  ngOnInit() {
    this.activity$.subscribe(res => this.activity = res);
    this.route.params.subscribe(params => {
      this.activityService.getActivity(params.id, true);
    });
  }

  goToTask(task: Task) {
    this.activityService.goToTask(task);
  }

  async topicComplete(topic: Topic) {
    const task = this.activity.tasks.find(r => r.id === topic.id && r.type === 'Topic');
    if (task.status !== 'done') {
      // mark the topic as complete
      await this.topicService.updateTopicProgress(topic.id, 'completed').subscribe();
    }
    // get the latest activity tasks and navigate to the next task
    this.activityService.getActivity(this.activity.id, true, task);
  }

}
