import { TopicService, Topic } from './topic.service';
import { Component, OnInit } from '@angular/core';
import { EmbedVideoService } from 'ngx-embed-video';
import { Router, ActivatedRoute } from '@angular/router';
import { FilestackService } from '@shared/filestack/filestack.service';
import { RouterEnter } from '@services/router-enter.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { NotificationService } from '@shared/notification/notification.service';
import { ActivityService, Task } from '../activity/activity.service';
import { SharedService } from '@services/shared.service';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent extends RouterEnter {
  routeUrl = '/topic/';
  topic: Topic = {
    id: 0,
    title: '',
    content: '',
    videolink: '',
    files: [],
    hasComments: false
  };
  iframeHtml = '';
  btnToggleTopicIsDone = false;
  loadingMarkedDone = true;
  loadingTopic = true;
  id = 0;
  activityId = 0;
  topicProgress: number;
  isLoadingPreview = false;

  constructor(
    private topicService: TopicService,
    private embedService: EmbedVideoService,
    public router: Router,
    private route: ActivatedRoute,
    private filestackService: FilestackService,
    public storage: BrowserStorageService,
    public utils: UtilsService,
    public notificationService: NotificationService,
    private activityService: ActivityService,
    private sharedService: SharedService
  ) {
    super(router);
  }

  private _initialise() {
    this.topic = {
      id: 0,
      title: '',
      content: '',
      videolink: '',
      files: [],
      hasComments: false
    };
    this.loadingMarkedDone = true;
    this.loadingTopic = true;
  }

  onEnter() {
    this._initialise();
    this.id = +this.route.snapshot.paramMap.get('id');
    this.activityId = +this.route.snapshot.paramMap.get('activityId');
    this._getTopic();
    this._getTopicProgress();
  }

  private _getTopic() {
    this.topicService.getTopic(this.id)
      .subscribe(topic => {
        this.topic = topic;
        this.loadingTopic = false;
        if ( topic.videolink ) {
          this.iframeHtml = this.embedService.embed(this.topic.videolink);
        }
      });
  }

  private _getTopicProgress() {
    this.topicService.getTopicProgress(this.activityId, this.id)
      .subscribe(result => {
        this.topicProgress = result;
        if (this.topicProgress !== null && this.topicProgress !== undefined) {
          if (this.topicProgress === 1) {
            this.btnToggleTopicIsDone = true;
          }
        }
        this.loadingMarkedDone = false;
      });
  }

  /**
   * @name markAsDone
   * @description set a topic as read by providing current id
   * @param {Function} callback optional callback function for further action after subcription is completed
   */
  markAsDone(callback?): Observable<any> {
    return this.topicService.updateTopicProgress(this.id).pipe(response => {
      // toggle event change should happen after subscription is completed
      this.btnToggleTopicIsDone = true;
      return response;
    });
  }

  /**
   * @name continue
   * @description button action to trigger `nextStepPrompt`
   */
  async continue(): Promise<any> {
    // if topic has been marked as read
    if (this.btnToggleTopicIsDone) {
      const nextSequence = await this.getNextSequence();
      if (nextSequence) {
        return this.navigateBySequence(nextSequence);
      }

      return this.router.navigate(['app', 'activity', this.activityId]);
    }

    // mark topic as done
    return this.markAsDone().subscribe(() => {
      return this.nextStepPrompt();
    });
  }

  /**
   * @name previewFile
   * @description open and preview file in a modal
   * @param {object} file filestack object
   */
  async previewFile(file) {
    if (this.isLoadingPreview === false) {
      this.isLoadingPreview = true;
      const filestack = await this.filestackService.previewFile(file);
      this.isLoadingPreview = false;
      return filestack;
    }
  }

  /**
   * @name navigateBySequence
   * @param {[type]} sequence [description]
   */
  private navigateBySequence(sequence) {
    const { contextId, isForTeam, id, type } = sequence;

    switch (type) {
      case 'Assessment':
        return this.router.navigate(['assessment', 'assessment', this.activityId , contextId, id]);
      case 'Topic':
        return this.router.navigate(['topic', this.activityId, id]);

      default:
        return this.router.navigate(['app', 'activity', this.activityId]);
    }
  }

  private async getNextSequence() {
    let tasks = this.sharedService.getCache('tasks');
    let nextTask = null;
    const options = {
      id: this.id,
      teamId: this.storage.getUser().teamId
    };

    // reuse cached tasks (if cache present, so no extra API call needed)
    if (tasks && tasks.length > 0) {
      nextTask = this.activityService.findNext(tasks, options);
    } else {
      this.loadingTopic = true;
      tasks = await this.activityService.getTaskWithStatusByActivityId(this.activityId);
      this.loadingTopic = false;
      this.sharedService.setCache('tasks', tasks);
      nextTask = this.activityService.findNext(tasks, options);
    }

    return nextTask;
  }

  /**
   * @name nextStepPrompt
   * @description
   */
  async nextStepPrompt(): Promise<any> {
    const nextSequence = await this.getNextSequence();

    if (nextSequence) {
      return this.notificationService.alert({
        header: 'Topic completed!',
        message: 'You may now proceed to the next topic.',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              return this.navigateBySequence(nextSequence);
            }
          }
        ]
      });

      return;
    }

    return this.notificationService.alert({
      header: 'Activity completed!',
      message: 'You may now proceed to the next activity.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            return this.router.navigate(['app', 'project']);
          }
        }
      ]
    });

    return this.router.navigate(['app', 'activity', this.activityId]);
  }

  back() {
    if (this.btnToggleTopicIsDone) {
      return this.router.navigate(['app', 'activity', this.activityId]);
    }

    const type = 'Topic';
    return this.notificationService.alert({
      header: `Complete ${type}?`,
      message: 'Would you like to mark this task as done?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            return this.router.navigate(['app', 'activity', this.activityId]);
          },
        },
        {
          text: 'Yes',
          handler: () => {
            return this.markAsDone().subscribe(() => {
              this.notificationService.popUp('shortMessage', { message: 'You\'ve completed the topic!' });
              return this.router.navigate(['app', 'activity', this.activityId]);
            });
          }
        }
      ]
    });
  }

}
