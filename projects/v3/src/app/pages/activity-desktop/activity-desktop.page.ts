import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityService, Task, Activity } from '@v3/app/services/activity.service';
import { Topic, TopicService } from '@v3/app/services/topic.service';

@Component({
  selector: 'app-activity-desktop',
  templateUrl: './activity-desktop.page.html',
  styleUrls: ['./activity-desktop.page.scss'],
})
export class ActivityDesktopPage implements OnInit {
  activity$ = this.service.activity$;
  currentTask$ = this.service.currentTask$;
  topic$ = this.topicService.topic$;

  activity: Activity;

  constructor(
    private route: ActivatedRoute,
    private service: ActivityService,
    private topicService: TopicService
  ) { }

  ngOnInit() {
    this.activity$.subscribe(res => this.activity = res);
    this.route.params.subscribe(params => {
      this.service.getActivity(params.id, true);
    });
  }

  goToTask(task: Task) {
    this.service.goToTask(task);
  }

  async topicComplete(topic: Topic) {
    const task = this.activity.tasks.find(r => r.id === topic.id && r.type === 'Topic');
    if (task.status !== 'done') {
      // mark the topic as complete
      await this.topicService.updateTopicProgress(topic.id, 'completed').subscribe();
    }
    // get the latest activity tasks and navigate to the next task
    this.service.getActivity(this.activity.id, true, task);
  }

}
