import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService, Task } from '@v3/app/services/activity.service';
import { TopicService, Topic } from '@v3/app/services/topic.service';
import { UtilsService } from '@v3/services/utils.service';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private topicService: TopicService,
    private activityService: ActivityService,
    private utils: UtilsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.topic$ = this.topicService.topic$;
  }

  ngOnInit() {
    this.topic$.subscribe(res => {
      this.ngZone.run(() => {
        this.topic = res;
        this.cdr.markForCheck();
      });
      if (res?.title) {
        this.utils.setPageTitle(`${res.title} - Practera`);
      }
    });
    this.activityService.currentTask$.subscribe(res => {
      this.ngZone.run(() => {
        this.currentTask = res;
        this.cdr.markForCheck();
      });
    });
    this.route.params.subscribe(params => {
      this.activityId = +params.activityId;
      this.topicService.getTopic(this.activityId, +params.id);
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
      this.activityService.goToNextTask(this.currentTask);
      this.btnDisabled$.next(false);
      return;
    }

    // mark the topic as completer
    await firstValueFrom(this.topicService.updateTopicProgress(this.topic.id, 'completed'));
    // get the latest activity tasks and navigate to the next task
    return this.activityService.getActivity(this.activityId, true, this.currentTask, () => {
      this.btnDisabled$.next(false);
    });
  }

  goBack() {
    this.router.navigate(['v3', 'activity-mobile', this.activityId]);
  }

}
