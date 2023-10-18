import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task } from '@v3/app/services/activity.service';
import { TopicService, Topic } from '@v3/app/services/topic.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-topic-mobile',
  templateUrl: './topic-mobile.page.html',
  styleUrls: ['./topic-mobile.page.scss'],
})
export class TopicMobilePage implements OnInit {
  topic$ = this.topicService.topic$;
  btnDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  topic: Topic;
  activityId: number;
  currentTask: Task

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private topicService: TopicService,
    private activityService: ActivityService
  ) { }

  ngOnInit() {
    this.topic$.subscribe(res => this.topic = res);
    this.activityService.currentTask$.subscribe(res => this.currentTask = res);
    this.route.params.subscribe(params => {
      this.topicService.getTopic(params.id);
      this.activityId = +params.activityId;
    });
  }

  async continue() {
    this.btnDisabled$.next(true);
    if (!this.currentTask) {
      this.currentTask = {
        id: this.topic.id,
        type: 'Topic',
        name: this.topic.title,
        status: ''
      };
    }

    if (this.currentTask.status === 'done') {
      // just go to the next task without any other action
      await this.activityService.goToNextTask(null, this.currentTask);
      this.btnDisabled$.next(false);
      return;
    }

    // mark the topic as completer
    await this.topicService.updateTopicProgress(this.topic.id, 'completed').toPromise();
    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(this.activityId, true, this.currentTask, () => {
      this.btnDisabled$.next(false);
    });
  }

  goBack() {
    this.router.navigate(['v3', 'activity-mobile', this.activityId]);
  }

}
