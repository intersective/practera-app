import { TopicService, Topic } from './topic.service';
import { Component, NgZone, Input, Output, EventEmitter, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
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
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import * as Plyr from 'plyr';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent extends RouterEnter {
  @Input() inputActivityId: number;
  @Input() inputId: number;
  @Output() navigate = new EventEmitter();
  @Output() changeStatus = new EventEmitter();
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
  askForMarkAsDone: boolean;
  redirecting = false;

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
    private sharedService: SharedService,
    private ngZone: NgZone,
    private newRelic: NewRelicService,
    @Inject(DOCUMENT) private readonly document: Document
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
    this.redirecting = false;
    this.isLoadingPreview = false;
    this.btnToggleTopicIsDone = false;
    this.askForMarkAsDone = false;
  }

  onEnter() {
    this._initialise();
    if (this.inputId) {
      this.id = +this.inputId;
    } else {
      this.id = +this.route.snapshot.paramMap.get('id');
    }
    if (this.inputActivityId) {
      this.activityId = +this.inputActivityId;
    } else {
      this.activityId = +this.route.snapshot.paramMap.get('activityId');
    }
    this._getTopic();
    this._getTopicProgress();

    setTimeout(() => this.askForMarkAsDone = true, 15000);
  }

  ionViewWillLeave() {
    this.sharedService.stopPlayingVideos();
  }

  private _getTopic() {
    this.topicService.getTopic(this.id)
      .subscribe(
        topic => {
          this.topic = topic;
          this.loadingTopic = false;
          if ( topic.videolink ) {
            this.iframeHtml = this.embedService.embed(this.topic.videolink, { attr: { class: !this.utils.isMobile() ? 'topic-video desktop-view' : 'topic-video' }});
          }
          this._initVideoPlayer();
          this.newRelic.setPageViewName(`Topic ${this.topic.title} ID: ${this.topic.id}`);
        },
        err => {
          this.newRelic.noticeError(`${JSON.stringify(err)}`);
        }
      );
  }

  // convert other brand video players to custom player.
  private _initVideoPlayer() {
    setTimeout(() => {
      this.utils.each(this.document.querySelectorAll('.video-embed'), embedVideo => {
        embedVideo.classList.remove('topic-video');
        if (!this.utils.isMobile()) {
          embedVideo.classList.remove('desktop-view');
        }
        embedVideo.classList.add('plyr__video-embed');
        // tslint:disable-next-line:no-unused-expression
        new Plyr(embedVideo as HTMLElement, {ratio: '16:9'});
        // if we have video tag, plugin will adding div tags to wrap video tag and main div contain .plyr css class.
        // so we need to add topic-video and desktop-view to that div to load video properly .
        if (embedVideo.nodeName === 'VIDEO') {
          embedVideo.classList.remove('plyr__video-embed');
          this.utils.each(this.document.querySelectorAll('.plyr'), videoPlayer => {
            if (!videoPlayer.classList.contains('topic-custome-player', 'desktop-view')) {
              videoPlayer.classList.add('topic-custome-player');
              if (!this.utils.isMobile()) {
                videoPlayer.classList.add('desktop-view');
              }
            }
          });
          return;
        }
        embedVideo.classList.add('topic-custome-player');
        if (!this.utils.isMobile()) {
          embedVideo.classList.add('desktop-view');
        }
      });
    // tslint:disable-next-line:align
    }, 500);
  }

  private _getTopicProgress() {
    this.topicService.getTopicProgress(this.activityId, this.id)
      .subscribe(
        result => {
          this.topicProgress = result;
          if (this.topicProgress !== null && this.topicProgress !== undefined) {
            if (this.topicProgress === 1) {
              this.btnToggleTopicIsDone = true;
            }
          }
          this.loadingMarkedDone = false;
        },
        err => {
          this.newRelic.noticeError(`${JSON.stringify(err)}`);
        }
      );
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
      this.changeStatus.emit(this.id);
      return response;
    });
  }

  /**
   * continue (mark as read) button
   * @description button action to trigger `gotoNextTask()`
   */
  async continue() {
    // if we are going to mark topic as done
    const markAsDone = !this.btnToggleTopicIsDone;
    // if topic has been marked as read
    if (!this.btnToggleTopicIsDone) {
      this.loadingMarkedDone = true;
      // mark topic as done
      try {
        await this.markAsDone().toPromise();
      } catch (err) {
        await this.notificationService.alert({
          header: 'Error marking topic as completed.',
          message: err.msg || JSON.stringify(err)
        });
        this.newRelic.noticeError(`${JSON.stringify(err)}`);
      }
      this.loadingMarkedDone = false;
    }

    this.redirecting = true;
    this.activityService.gotoNextTask(this.activityId, 'topic', this.topic.id, markAsDone).then(redirect => {
      this.redirecting = false;
      if (redirect) {
        this._navigate(redirect);
      }
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

      try {
        const filestack = await this.filestackService.previewFile(file);
        this.isLoadingPreview = false;
        return filestack;
      } catch (err) {
        const toasted = await this.notificationService.alert({
          header: 'Error Previewing file',
          message: err.msg || JSON.stringify(err)
        });
        this.loadingTopic = false;
        this.newRelic.noticeError(`${JSON.stringify(err)}`);
      }
    }
  }

  // force every navigation happen under radar of angular
  private _navigate(direction): Promise<boolean> {
    if (!direction) {
      return;
    }
    if (this.utils.isMobile()) {
      // redirect to topic/assessment page for mobile
      return this.ngZone.run(() => {
        return this.router.navigate(direction);
      });
    } else {
      // emit event to parent component(task component)
      switch (direction[0]) {
        case 'topic':
          this.navigate.emit({
            type: 'topic',
            topicId: direction[2]
          });
          break;
        case 'assessment':
          this.navigate.emit({
            type: 'assessment',
            contextId: direction[3],
            assessmentId: direction[4]
          });
          break;
        default:
          return this.ngZone.run(() => {
            return this.router.navigate(direction);
          });
      }
    }
  }

  back() {
    if (this.btnToggleTopicIsDone || !this.askForMarkAsDone) {
      return this._navigate([
        'app',
        'activity',
        this.activityId
      ]);
    }

    const type = 'Topic';
    return this.notificationService.alert({
      header: `Complete ${type}?`,
      message: 'Would you like to mark this task as done?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            return this._navigate(['app', 'activity', this.activityId]);
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.newRelic.addPageAction('Mark as read before back');
            return this.markAsDone().subscribe(
              () => {
                return this.notificationService.presentToast('You\'ve completed the topic!').then(() => this._navigate([
                  'app',
                  'activity',
                  this.activityId,
                ]));
              },
              err => {
                this.newRelic.noticeError(`${JSON.stringify(err)}`);
              });
          }
        }
      ]
    });
  }

}
