import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task } from '@v3/app/services/activity.service';
import { TopicService, Topic } from '@v3/app/services/topic.service';
import { UtilsService } from '@v3/services/utils.service';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { TopicContinueEvent } from '@v3/app/components/topic/topic.component';

@Component({
  standalone: false,
  selector: 'app-topic-mobile',
  templateUrl: './topic-mobile.page.html',
  styleUrls: ['./topic-mobile.page.scss'],
})
export class TopicMobilePage implements OnInit {
  topic$: Observable<Topic>;
  btnDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  topic: Topic;
  activityId: number;
  currentTask: Task;
  private topicId: number;
  private selectedTask: Task;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private topicService: TopicService,
    private activityService: ActivityService,
    private utils: UtilsService
  ) {
    this.topic$ = this.topicService.topic$;
  }

  ngOnInit() {
    this.topic$.subscribe(res => {
      this.topic = res;
      if (res?.title) {
        this.utils.setPageTitle(`${res.title} - Practera`);
      }
    });
    this.activityService.currentTask$.subscribe(task => {
      this.selectedTask = task;
      if (this.isCurrentTopicTask(task)) {
        this.currentTask = task;
      }
    });
    this.route.params.subscribe(params => {
      this.activityId = +params.activityId;
      this.topicId = +params.id;
      this.currentTask = this.isCurrentTopicTask(this.selectedTask) ? this.selectedTask : null;
      this.topicService.getTopic(this.topicId);
      this.restoreCurrentTaskStatus();
    });
  }

  private isCurrentTopicTask(task: Task): boolean {
    return task?.id === this.topicId && task?.type === 'Topic';
  }

  // Restore the current task status from the activity service
  private restoreCurrentTaskStatus() {
    const activityId = this.activityId;
    const topicId = this.topicId;

    this.activityService.getActivity(activityId, false, null, (activity) => {
      // Ignore a late response from a topic route that has since changed.
      if (this.activityId !== activityId || this.topicId !== topicId) {
        return;
      }

      const task = activity?.tasks?.find(candidate =>
        candidate.id === topicId && candidate.type === 'Topic'
      );
      if (task) {
        this.currentTask = task;
      }
    });
  }

  async continue(event?: TopicContinueEvent) {
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
      this.activityService.goToNextTask(this.currentTask);
      this.btnDisabled$.next(false);
      return;
    }

    // mark the topic as completer
    await firstValueFrom(this.topicService.updateTopicProgress(this.topic.id, 'completed', event?.attention));
    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(this.activityId, true, this.currentTask, () => {
      this.btnDisabled$.next(false);
    });
  }

  goBack() {
    this.router.navigate(['v3', 'activity-mobile', this.activityId]);
  }

}
