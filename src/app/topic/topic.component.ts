import { TopicService, Topic } from './topic.service';
import { Component, OnInit } from '@angular/core';
import { EmbedVideoService } from 'ngx-embed-video';
import { Router, ActivatedRoute } from '@angular/router';
import { FilestackService } from '@shared/filestack/filestack.service';
import { RouterEnter } from '@services/router-enter.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { NotificationService } from '@shared/notification/notification.service';

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

  markAsDone() {
    this.btnToggleTopicIsDone = true;
    this.topicService.updateTopicProgress(this.id).subscribe(result => {
      this.router.navigate(['app', 'activity', this.activityId]);
    });
  }

  async previewFile(file) {
    if (this.isLoadingPreview === false) {
      this.isLoadingPreview = true;
      await this.filestackService.previewFile(file);
      this.isLoadingPreview = false;
    }
  }

  back() {
    this.router.navigate(['app', 'activity', this.activityId]);
  }

}
