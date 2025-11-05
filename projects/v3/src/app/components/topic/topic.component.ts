import { Topic, TopicService } from '@v3/services/topic.service';
import { Component, Input, Output, EventEmitter, Inject, OnChanges, SimpleChanges, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UtilsService } from '@v3/services/utils.service';
import { SharedService } from '@v3/services/shared.service';
import * as Plyr from 'plyr';
import { EmbedVideoService } from '@v3/services/ngx-embed-video.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { FilestackService } from '@v3/app/services/filestack.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BehaviorSubject, exhaustMap, filter, finalize, Subject, Subscription } from 'rxjs';
import { Activity, Task } from '@v3/app/services/activity.service';
import { ComponentCleanupService } from '@v3/app/services/component-cleanup.service';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit, OnChanges, OnDestroy {
  @Input() topic: Topic;
  @Input() task: Task;
  continuing: boolean;
  @Output() continue = new EventEmitter();
  @Input() buttonDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isMobile: boolean;

  btnToggleTopicIsDone = false;
  isLoadingPreview = false;

  iframeHtml: SafeHtml;
  sanitizedTitle: SafeHtml;

  private continueAction$ = new Subject<Topic>();
  private cleanupSub: Subscription;

  constructor(
    private embedService: EmbedVideoService,
    private notification: NotificationsService,
    private utils: UtilsService,
    private sharedService: SharedService,
    private filestack: FilestackService,
    private topicService: TopicService,
    private sanitizer: DomSanitizer,
    private cleanupService: ComponentCleanupService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.isMobile = this.utils.isMobile();
    this.cleanupSub = this.cleanupService.cleanup$.subscribe(() => {
      this.cleanupMedia();
    });
  }

  ngOnInit() {
    this.continueAction$.pipe(
      filter(() => !this.continuing),
      exhaustMap((topic) => {
        this.continuing = true;
        this.buttonDisabled$.next(true);

        this.continue.emit(topic);

        // 1sec cooldown to prevent multiple clicks
        return new Promise(resolve => setTimeout(resolve, 1000));
      }),
      finalize(() => {
        this.continuing = false;
        this.buttonDisabled$.next(false);
      })
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.continuing = false;
    if (this.topic) {
      if (this.topic.videolink) {
        this._setVideoUrlElelemts();
      }
      this._initVideoPlayer();
      this.buttonDisabled$.next(false);
    }

    if (changes.topic?.currentValue?.title) {
      this.sanitizedTitle = this.sanitizer.bypassSecurityTrustHtml(changes.topic?.currentValue?.title);
    }

    if (changes.topic?.currentValue) {
      this.buttonDisabled$.next(false);
    }
  }

  ngOnDestroy(): void {
    this.sharedService.stopPlayingVideos();
    this.topicService.clearTopic();
    this.cleanupMedia();
    this.cleanupSub.unsubscribe();
    this.continueAction$.complete();
  }

  ionViewWillLeave() {
    this.sharedService.stopPlayingVideos();
  }

  ionViewDidLeave() {
    this.topicService.clearTopic();
  }

  public cleanupMedia() {
    this._pauseResetAndReplaceMediaElements('audio');
    this._pauseResetAndReplaceMediaElements('video');

    // remove any plyr instances when necessary
    this.utils.each(this.document.querySelectorAll('.plyr'), (plyrEl: HTMLElement) => {
      if ((plyrEl as any).plyr) {
        (plyrEl as any).plyr.destroy();
        (plyrEl as any).plyr = null;
      }
    });

    // nullify iframehtml reference for garbage collection
    this.iframeHtml = null;
  }

  private _pauseResetAndReplaceMediaElements(selector: 'audio' | 'video') {
    const elements = this.document.querySelectorAll(selector);
    elements.forEach((el: HTMLMediaElement) => {
      el.pause();
      el.currentTime = 0;
      const newEl = el.cloneNode(true);
      el.parentNode?.replaceChild(newEl, el);
    });
  }

  private _setVideoUrlElelemts() {
    if (this.topic.videolink.includes('vimeo') ||
      this.topic.videolink.includes('youtube') ||
      this.topic.videolink.includes('youtu.be')) {
      this.iframeHtml =
        this.embedService.embed(this.topic.videolink, {
          attr: {
            class: !this.utils.isMobile()
              ? "topic-video desktop-view"
              : "topic-video",
          },
        }) || null;
    }
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
        new Plyr(embedVideo as HTMLElement, { ratio: '16:9' });
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
    }, 500);
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

        const filestack = await this.filestack.previewFile(file);
        this.isLoadingPreview = false;
        return filestack;
      } catch (err) {
        const toasted = await this.notification.alert({
          header: 'Error Previewing file',
          message: err.msg || JSON.stringify(err)
        });
        return toasted;
      }
    }
  }

  actionBtnClick(file, index: number) {
    switch (index) {
      case 0:
        this.utils.downloadFile(file.url);
        break;
      case 1:
        this.previewFile(file);
        break;
    }
  }

  async actionBarContinue(topic): Promise<void> {
    this.continueAction$.next(topic);
  }

  handleVideoError(videoError) {
    console.error('Video Error::', videoError);
  }
}
