import { Topic, TopicService } from '@v3/services/topic.service';
import { Component, Input, Output, EventEmitter, Inject, OnChanges, SimpleChanges, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UtilsService } from '@v3/services/utils.service';
import { SharedService } from '@v3/services/shared.service';
import * as Plyr from 'plyr';
import { EmbedVideoService } from '@v3/services/ngx-embed-video.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { FilestackService } from '@v3/app/services/filestack.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BehaviorSubject, exhaustMap, filter, finalize, Subject, Subscription, takeUntil } from 'rxjs';
import { Task } from '@v3/app/services/activity.service';
import { ComponentCleanupService } from '@v3/app/services/component-cleanup.service';
import { ModalController } from '@ionic/angular';
import { FilePopupComponent } from '../file-popup/file-popup.component';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  @Input() topic: Topic;
  @Input() task: Task;
  continuing: boolean;
  @Output() continue = new EventEmitter();
  @Input() buttonDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @ViewChild('topicVideo', { static: false }) topicVideo: ElementRef<HTMLVideoElement>;

  isMobile: boolean;

  btnToggleTopicIsDone = false;
  isLoadingPreview = false;

  iframeHtml: SafeHtml;
  sanitizedTitle: SafeHtml;
  videoSrc: string;

  private continueAction$ = new Subject<Topic>();
  private cleanupSub: Subscription;
  private videoNeedsInit = false;
  private plyrNeedsInit = false;
  private plyrInitialized = false;
  private destroy$ = new Subject<void>();
  private plyrInstances = new WeakMap<Element, Plyr>();

  constructor(
    private embedService: EmbedVideoService,
    private notification: NotificationsService,
    private utils: UtilsService,
    private sharedService: SharedService,
    private filestack: FilestackService,
    private topicService: TopicService,
    private sanitizer: DomSanitizer,
    private cleanupService: ComponentCleanupService,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController,
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
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.continuing = false;
    if (this.topic && changes.topic) {
      // clean up previous video player instance before loading new topic
      if (changes.topic.previousValue) {
        this.cleanupMedia();

        // force template to clear by setting null and triggering change detection
        // this ensures angular removes the old .video-embed div completely
        this.iframeHtml = null;
        this.cdr.detectChanges();
      }

      // reset state for new topic
      this.videoNeedsInit = false;
      this.plyrNeedsInit = false;
      this.plyrInitialized = false;

      if (this.topic.videolink) {
        // this may set iframeHtml for youtube/vimeo embeds
        this._setVideoUrlElelemts();

        // for native videos (non-embeds), set source and mark for init
        if (!this.iframeHtml) {
          this.videoSrc = this.topic.videolink;
          this.videoNeedsInit = true;
        } else {
          this.videoSrc = null;
          // mark that plyr initialization is needed for iframe
          this.plyrNeedsInit = true;
        }
      } else {
        this.videoSrc = null;
      }

    }

    if (changes.topic?.currentValue?.title) {
      this.sanitizedTitle = this.sanitizer.bypassSecurityTrustHtml(changes.topic?.currentValue?.title);
    }

    if (changes.topic?.currentValue) {
      this.buttonDisabled$.next(false);
    }
  }

  ngAfterViewChecked(): void {
    // initialize native video when it becomes available in the DOM
    if (this.videoNeedsInit && this.topicVideo?.nativeElement) {
      this.videoNeedsInit = false;

      // Capture the videoSrc value to avoid race conditions
      const capturedSrc = this.videoSrc;
      requestAnimationFrame(() => {
        const videoEl = this.topicVideo?.nativeElement;
        // Validate that the video element still exists and the src hasn't changed
        if (videoEl && capturedSrc && videoEl.src !== capturedSrc) {
          videoEl.src = capturedSrc;
          videoEl.load();
        }
      });
    }

    // initialize plyr for iframe embeds when they appear in DOM
    if (this.plyrNeedsInit && !this.plyrInitialized) {
      const videoEmbeds = this.document.querySelectorAll('.video-embed');
      if (videoEmbeds.length > 0) {
        this.plyrNeedsInit = false;
        this.plyrInitialized = true;

        requestAnimationFrame(() => {
          this._initVideoPlayer();
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    // destroy and remove all plyr instances
    const plyrElements = this.document.querySelectorAll('.plyr__video-embed');
    this.utils.each(plyrElements, (plyrEl: HTMLElement) => {
      const plyrInstance = this.plyrInstances.get(plyrEl);
      if (plyrInstance) {
        try {
          plyrInstance.destroy();
        } catch (e) {
          console.warn('error destroying plyr instance:', e);
        }
        this.plyrInstances.delete(plyrEl);
      }
    });

    // reset plyr initialization flags to allow re-initialization
    this.plyrInitialized = false;
    this.plyrNeedsInit = false;

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

  // initialize plyr player for youtube/vimeo iframe embeds
  private _initVideoPlayer() {
    const embedVideos = this.document.querySelectorAll('.video-embed');

    this.utils.each(embedVideos, (embedVideo, index) => {
      // skip native video elements - they use html5 controls
      if (embedVideo.nodeName === 'VIDEO') {
        return;
      }

      // skip if already has plyr wrapper to prevent double initialization
      if (embedVideo.parentElement?.classList.contains('plyr')) {
        return;
      }

      embedVideo.classList.remove('topic-video');
      if (!this.utils.isMobile()) {
        embedVideo.classList.remove('desktop-view');
      }
      embedVideo.classList.add('plyr__video-embed');

      const uniqueId = `plyr-${this.topic?.id || 'unknown'}-${index}-${Date.now()}`;
      embedVideo.setAttribute('data-plyr-id', uniqueId);

      const plyrInstance = new Plyr(embedVideo as HTMLElement, {
        ratio: '16:9',
        autoplay: false,
        clickToPlay: true,
        hideControls: false,
        controls: [
          'play-large', 'play', 'progress', 'current-time',
          'mute', 'volume', 'settings', 'fullscreen'
        ],
        youtube: {
          noCookie: true,
          iv_load_policy: 3,
          modestbranding: 1
        }
      });

      // store plyr instance reference for cleanup using WeakMap
      this.plyrInstances.set(embedVideo, plyrInstance);

      if (!this.utils.isMobile()) {
        embedVideo.classList.add('desktop-view');
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
        if (this._isVideoFile(file)) {
          // show browser-supported video in modal with html5 player
          this.previewVideoFile(file);
        } else if (this._isFilestackUrl(file.url) && this._isFilestackPreviewSupported(file)) {
          // show filestack document viewer
          this.previewFile(file);
        } else {
          // non-filestack files: open in new tab as download fallback
          window.open(file.url, '_blank');
        }
        break;
    }
  }

  /**
   * @description checks if a url is a filestack cdn url
   */
  private _isFilestackUrl(url: string): boolean {
    return url?.includes('filestackcontent') || false;
  }

  /**
   * @description checks if file is a browser-supported video format (mp4, webm, ogg)
   */
  private _isVideoFile(file: { url: string; name: string }): boolean {
    const supportedExtensions = ['.mp4', '.webm', '.ogg'];
    const urlLower = (file.url || '').toLowerCase();
    const nameLower = (file.name || '').toLowerCase();
    return supportedExtensions.some(ext => urlLower.endsWith(ext) || nameLower.endsWith(ext));
  }

  /**
   * @description derives video mime type from file extension
   */
  private _getVideoMimeType(file: { url: string; name: string }): string {
    const name = (file.name || file.url || '').toLowerCase();
    if (name.endsWith('.webm')) return 'video/webm';
    if (name.endsWith('.ogg')) return 'video/ogg';
    return 'video/mp4';
  }

  /**
   * @description checks if a file type is supported by filestack document viewer.
   * supported: pdf, ppt/pptx, xls/xlsx, doc/docx, odt, odp, images, html, txt, ai, psd.
   * unsupported: audio and video files (filestack doesn't support media preview).
   */
  private _isFilestackPreviewSupported(file: { url: string; name: string }): boolean {
    const unsupportedExtensions = [
      // audio formats
      '.mp3', '.wav', '.ogg', '.aac', '.flac', '.wma', '.m4a',
      // video formats (filestack doesn't support any video preview)
      '.mp4', '.webm', '.avi', '.mov', '.wmv', '.mkv', '.flv', '.m4v',
    ];
    const urlLower = (file.url || '').toLowerCase();
    const nameLower = (file.name || '').toLowerCase();
    return !unsupportedExtensions.some(ext => urlLower.endsWith(ext) || nameLower.endsWith(ext));
  }

  /**
   * @description preview browser-supported video file in modal with html5 video player
   */
  async previewVideoFile(file: { url: string; name: string }): Promise<void> {
    const modal = await this.modalController.create({
      component: FilePopupComponent,
      componentProps: {
        file: {
          url: file.url,
          name: file.name,
          type: this._getVideoMimeType(file),
        },
      },
    });
    return await modal.present();
  }

  /**
   * @description returns action button icons for file attachment based on preview support.
   * preview icon shown for:
   * - browser-supported video files: mp4, webm, ogg (shown in html5 video modal)
   * - filestack urls with document viewer supported file types
   */
  getFileActionIcons(file: { url: string; name: string }): string[] {
    const canPreview = this._isVideoFile(file) ||
                      (this._isFilestackUrl(file.url) && this._isFilestackPreviewSupported(file));
    return canPreview ? ['download', 'search'] : ['download'];
  }

  async actionBarContinue(topic): Promise<void> {
    if (this.continueAction$) {
      this.continueAction$.next(topic);
    }
  }

  handleVideoError(videoError: Event): void {
    console.error('Video Error::', videoError);
    const target = videoError.target as HTMLVideoElement;
    if (target) {
      const errorCode = target.error?.code;
      const errorMessage = target.error?.message;
      console.error('Video error details:', {
        code: errorCode,
        message: errorMessage,
        src: target.src,
        networkState: target.networkState,
        readyState: target.readyState
      });

      // notify user of video playback issues
      if (errorCode) {
        this.notification.alert({
          header: 'Video Playback Error',
          message: 'Unable to load or play the video. Please check your connection and try again.'
        });
      }
    }
  }

  onVideoCanPlay(event: Event) {
    const video = event.target as HTMLVideoElement;
    video.removeAttribute('disabled');
  }
}
