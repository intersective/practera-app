import { Topic, TopicService } from '@v3/services/topic.service';
import { DOCUMENT } from '@angular/common';
import { Component, Input, Output, EventEmitter, Inject, OnChanges, SimpleChanges, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';

import { UtilsService } from '@v3/services/utils.service';
import { SharedService } from '@v3/services/shared.service';
import Plyr from 'plyr';
import { EmbedVideoService } from '@v3/services/ngx-embed-video.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { FilePreviewService } from '@v3/app/services/file-preview.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { BehaviorSubject, exhaustMap, filter, finalize, Subject, Subscription, takeUntil } from 'rxjs';
import { Task } from '@v3/app/services/activity.service';
import { ComponentCleanupService } from '@v3/app/services/component-cleanup.service';
import { ModalController } from '@ionic/angular';
import { FilePopupComponent } from '../file-popup/file-popup.component';
import { buildTopicAttentionMetrics, TopicAttentionMetrics } from '@v3/app/models/topic-attention.model';
import { BrowserStorageService } from '@v3/services/storage.service';

export interface TopicContinueEvent {
  topic: Topic;
  attention: TopicAttentionMetrics;
}

interface MediaAttentionSource {
  currentTime?: number;
  duration?: number;
}

interface AttentionListener {
  target: EventTarget;
  eventName: string;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
}

@Component({
  standalone: false,
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  @Input() topic: Topic;
  @Input() task: Task;
  continuing: boolean;
  @Output() continue = new EventEmitter<TopicContinueEvent>();
  @Input() buttonDisabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @ViewChild('topicVideo', { static: false }) topicVideo: ElementRef<HTMLVideoElement>;

  isMobile: boolean;

  btnToggleTopicIsDone = false;
  isLoadingPreview = false;

  iframeHtml: SafeHtml;
  sanitizedTitle: SafeHtml;
  sanitizedSummary: SafeHtml;
  videoSrc: string;
  formattedTopicTimeSpent = '0:00';

  private continueAction$ = new Subject<Topic>();
  private cleanupSub: Subscription;
  private videoNeedsInit = false;
  private plyrNeedsInit = false;
  private plyrInitialized = false;
  private destroy$ = new Subject<void>();
  private plyrInstances = new WeakMap<Element, Plyr>();
  private attentionVisibleStartedAt = 0;
  private attentionVisibleMs = 0;
  private attentionTextWordCount = 0;
  private attentionContentExposureRatio = 0;
  private attentionFilePreviewCount = 0;
  private attentionFileDownloadCount = 0;
  private attentionMediaProgressRatio = 0;
  private attentionMediaPlayedMs = 0;
  private attentionMediaPlayStartedAt = new WeakMap<object, number>();
  private attentionListeners: AttentionListener[] = [];
  private trackedMediaSources = new WeakSet<object>();
  private readonly handleAttentionVisibilityChange = () => this.updateVisibilityTracking();
  private readonly handleAttentionExposureChange = () => this.updateContentExposureRatio();
  private topicTimeSpentMs = 0;
  private topicTimerStartedAt = 0;
  private topicTimerIntervalId: ReturnType<typeof setInterval> | null = null;
  private topicTimerStorageId: number | null = null;
  private readonly topicTimeSpentStoragePrefix = 'topicTimeSpent';

  constructor(
    private embedService: EmbedVideoService,
    private notification: NotificationsService,
    private utils: UtilsService,
    private sharedService: SharedService,
    private filePreviewService: FilePreviewService,
    private topicService: TopicService,
    private sanitizer: DomSanitizer,
    private cleanupService: ComponentCleanupService,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController,
    private storage: BrowserStorageService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.isMobile = this.utils.isMobile();
    this.cleanupSub = this.cleanupService.cleanup$.subscribe(() => {
      this.stopTopicTimeTracking();
      this.stopAttentionTracking();
      this.cleanupMedia();
    });
  }

  ngOnInit() {
    this.continueAction$.pipe(
      filter(() => !this.continuing),
      exhaustMap((topic) => {
        this.continuing = true;
        this.buttonDisabled$.next(true);

        this.continue.emit({
          topic,
          attention: this.getAttentionMetrics(),
        });
        this.clearTopicTimeTrackingIfComplete(topic);

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
    if (changes.task) {
      if (this.task?.type === 'Topic' && this.task?.id) {
        this.startTopicTimeTracking(this.task.id);
      } else if (changes.task.previousValue?.type === 'Topic') {
        this.stopTopicTimeTracking();
      }
    }

    if (this.topic && changes.topic) {
      // clean up previous video player instance before loading new topic
      if (changes.topic.previousValue) {
        this.stopAttentionTracking();
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
      this.startAttentionTracking(this.topic);
      this.startTopicTimeTracking(this.getCurrentTopicTimerId(this.topic));

      if (this.topic.videoLink) {
        // this may set iframeHtml for youtube/vimeo embeds
        this._setVideoUrlElelemts();

        // for native videos (non-embeds), set source and mark for init
        if (!this.iframeHtml) {
          this.videoSrc = this.topic.videoLink;
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
    if (changes.topic?.currentValue?.summary !== undefined) {
      this.sanitizedSummary = changes.topic.currentValue.summary
        ? this.sanitizer.bypassSecurityTrustHtml(changes.topic.currentValue.summary)
        : null;
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
          this.trackRenderedMediaElements();
        });
      }
    }

    this.trackRenderedMediaElements();
    this.updateContentExposureRatio();
  }

  ngOnDestroy(): void {
    this.stopTopicTimeTracking();
    this.stopAttentionTracking();
    this.destroy$.next();
    this.destroy$.complete();
    this.sharedService.stopPlayingVideos();
    this.topicService.clearTopic();
    this.cleanupMedia();
    this.cleanupSub.unsubscribe();
    this.continueAction$.complete();
  }

  ionViewWillLeave() {
    this.stopTopicTimeTracking();
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
    if (this.topic.videoLink.includes('vimeo') ||
      this.topic.videoLink.includes('youtube') ||
      this.topic.videoLink.includes('youtu.be')) {
      this.iframeHtml =
        this.embedService.embed(this.topic.videoLink, {
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
      this.trackMediaSource(plyrInstance as unknown as MediaAttentionSource & object);

      if (!this.utils.isMobile()) {
        embedVideo.classList.add('desktop-view');
      }
    });
  }

  /**
   * @name previewFile
   * @description open and preview file in a modal
   * @param {object} file uploaded file object
   */
  async previewFile(file) {
    if (this.isLoadingPreview === false) {
      this.isLoadingPreview = true;
      try {

        const result = await this.filePreviewService.preview(file);
        this.attentionFilePreviewCount += 1;
        this.isLoadingPreview = false;
        return result;
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
        this.attentionFileDownloadCount += 1;
        this.utils.downloadFile(file.url);
        break;
      case 1:
        if (this._isVideoFile(file)) {
          // show browser-supported video in modal with html5 player
          this.previewVideoFile(file);
        } else if (this._isDocumentPreviewSupported(file)) {
          this.previewFile(file);
        } else {
          window.open(file.url, '_blank');
        }
        break;
    }
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
   * @description checks if a file type is supported for in-app document preview.
   * supported: pdf, ppt/pptx, xls/xlsx, doc/docx, odt, odp, images, html, txt, ai, psd.
   * unsupported: audio and unsupported video formats.
   */
  private _isDocumentPreviewSupported(file: { url: string; name: string; mimetype?: string }): boolean {
    if (file.mimetype) {
      const mime = file.mimetype.toLowerCase();
      if (mime.startsWith('audio/') || mime.startsWith('video/')) {
        return false;
      }
      if (mime.startsWith('image/') || mime === 'application/pdf' || mime.startsWith('text/')) {
        return true;
      }
    }
    const unsupportedExtensions = [
      // audio formats
      '.mp3', '.wav', '.ogg', '.aac', '.flac', '.wma', '.m4a',
      // video formats (handled separately or opened externally)
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
    this.attentionFilePreviewCount += 1;
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
   * - document types supported by the in-app preview modal
   */
  getFileActionIcons(file: { url: string; name: string; mimetype?: string }): string[] {
    const canPreview = this._isVideoFile(file) || this._isDocumentPreviewSupported(file);
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

  private startAttentionTracking(topic: Topic): void {
    this.stopAttentionTracking();
    this.attentionTextWordCount = this.countWordsFromHtml(topic.rawContent || '');
    this.attentionVisibleStartedAt = this.document.hidden ? 0 : Date.now();
    this.attentionVisibleMs = 0;
    this.attentionContentExposureRatio = 0;
    this.attentionFilePreviewCount = 0;
    this.attentionFileDownloadCount = 0;
    this.attentionMediaProgressRatio = 0;
    this.attentionMediaPlayedMs = 0;
    this.attentionMediaPlayStartedAt = new WeakMap<object, number>();
    this.trackedMediaSources = new WeakSet<object>();

    this.addAttentionListener(this.document, 'visibilitychange', this.handleAttentionVisibilityChange);
    this.addAttentionListener(this.document, 'scroll', this.handleAttentionExposureChange, true);
    if (typeof window !== 'undefined') {
      this.addAttentionListener(window, 'resize', this.handleAttentionExposureChange);
    }

    requestAnimationFrame(() => this.updateContentExposureRatio());
  }

  private stopAttentionTracking(): void {
    this.stopAllMediaPlayTimers();
    this.flushVisibleTime();
    this.attentionListeners.forEach(listener => {
      listener.target.removeEventListener(listener.eventName, listener.handler, listener.options);
    });
    this.attentionListeners = [];
    this.attentionVisibleStartedAt = 0;
  }

  private getAttentionMetrics(): TopicAttentionMetrics {
    this.flushVisibleTime();
    this.stopAllMediaPlayTimers();
    this.updateContentExposureRatio();
    this.trackRenderedMediaElements();

    return buildTopicAttentionMetrics({
      activeMs: this.attentionVisibleMs,
      visibleMs: this.attentionVisibleMs,
      textWordCount: this.attentionTextWordCount,
      contentExposureRatio: this.attentionContentExposureRatio,
      mediaProgressRatio: this.attentionMediaProgressRatio,
      mediaPlayedMs: this.attentionMediaPlayedMs,
      filePreviewCount: this.attentionFilePreviewCount,
      fileDownloadCount: this.attentionFileDownloadCount,
      fileCount: this.topic?.files?.length || 0,
      hasMedia: !!(this.topic?.videoLink || this.topic?.audio),
    });
  }

  private flushVisibleTime(): void {
    if (this.attentionVisibleStartedAt > 0) {
      this.attentionVisibleMs += Date.now() - this.attentionVisibleStartedAt;
      this.attentionVisibleStartedAt = this.document.hidden ? 0 : Date.now();
    }
  }

  private updateVisibilityTracking(): void {
    if (this.document.hidden) {
      this.flushVisibleTime();
      this.stopAllMediaPlayTimers();
      return;
    }

    if (this.attentionVisibleStartedAt === 0) {
      this.attentionVisibleStartedAt = Date.now();
    }
  }

  private updateContentExposureRatio(): void {
    if (!this.topic?.id) {
      return;
    }

    const contentElement = this.document.getElementById(`topic-description-${this.topic.id}`);
    if (!contentElement) {
      return;
    }

    const rect = contentElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight || this.document.documentElement.clientHeight || 0;
    const elementHeight = Math.max(rect.height, 1);
    const exposedHeight = Math.min(elementHeight, Math.max(0, viewportHeight - rect.top));
    this.attentionContentExposureRatio = Math.max(
      this.attentionContentExposureRatio,
      Math.min(1, exposedHeight / elementHeight)
    );
  }

  private trackRenderedMediaElements(): void {
    this.document.querySelectorAll('audio, video').forEach((media: HTMLMediaElement) => {
      this.trackMediaSource(media);
    });
  }

  private trackMediaSource(source: MediaAttentionSource & object): void {
    if (this.trackedMediaSources.has(source)) {
      return;
    }
    this.trackedMediaSources.add(source);

    const updateProgress = () => this.updateMediaProgress(source);
    const startPlaying = () => this.startMediaPlayTimer(source);
    const stopPlaying = () => this.stopMediaPlayTimer(source);

    if (source instanceof HTMLMediaElement) {
      this.addAttentionListener(source, 'timeupdate', updateProgress);
      this.addAttentionListener(source, 'play', startPlaying);
      this.addAttentionListener(source, 'pause', stopPlaying);
      this.addAttentionListener(source, 'ended', stopPlaying);
      return;
    }

    const plyrSource = source as Plyr;
    plyrSource.on('timeupdate', updateProgress);
    plyrSource.on('play', startPlaying);
    plyrSource.on('pause', stopPlaying);
    plyrSource.on('ended', stopPlaying);
  }

  private startMediaPlayTimer(source: object): void {
    if (!this.document.hidden && !this.attentionMediaPlayStartedAt.get(source)) {
      this.attentionMediaPlayStartedAt.set(source, Date.now());
    }
  }

  private stopMediaPlayTimer(source: object): void {
    const startedAt = this.attentionMediaPlayStartedAt.get(source);
    if (startedAt) {
      this.attentionMediaPlayedMs += Date.now() - startedAt;
      this.attentionMediaPlayStartedAt.delete(source);
    }
    this.updateMediaProgress(source as MediaAttentionSource);
  }

  private stopAllMediaPlayTimers(): void {
    this.document.querySelectorAll('audio, video').forEach((media: HTMLMediaElement) => {
      this.stopMediaPlayTimer(media);
    });

    const plyrElements = this.document.querySelectorAll('.plyr__video-embed');
    this.utils.each(plyrElements, (plyrEl: HTMLElement) => {
      const plyrInstance = this.plyrInstances.get(plyrEl);
      if (plyrInstance) {
        this.stopMediaPlayTimer(plyrInstance);
      }
    });
  }

  private updateMediaProgress(source: MediaAttentionSource): void {
    const duration = Number(source.duration);
    const currentTime = Number(source.currentTime);
    if (Number.isFinite(duration) && duration > 0 && Number.isFinite(currentTime)) {
      this.attentionMediaProgressRatio = Math.max(
        this.attentionMediaProgressRatio,
        Math.min(1, Math.max(0, currentTime / duration))
      );
    }
  }

  private addAttentionListener(
    target: EventTarget,
    eventName: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(eventName, handler, options);
    this.attentionListeners.push({ target, eventName, handler, options });
  }

  private countWordsFromHtml(html: string): number {
    if (!html) {
      return 0;
    }

    const element = this.document.createElement('div');
    element.innerHTML = html;
    const text = element.textContent || '';
    return text.match(/[\p{L}\p{N}]+/gu)?.length || 0;
  }

  private startTopicTimeTracking(topicId: number): void {
    if (!topicId) {
      return;
    }

    if (this.topicTimerStorageId === topicId && this.topicTimerStartedAt > 0) {
      return;
    }

    this.stopTopicTimeTracking();
    this.topicTimerStorageId = topicId;
    this.topicTimeSpentMs = this.getPersistedTopicTimeSpent(topicId);
    this.topicTimerStartedAt = Date.now();
    this.updateTopicTimeSpentDisplay();
    this.topicTimerIntervalId = setInterval(() => this.updateTopicTimeSpentDisplay(), 1000);
  }

  private stopTopicTimeTracking(): void {
    if (this.topicTimerIntervalId) {
      clearInterval(this.topicTimerIntervalId);
      this.topicTimerIntervalId = null;
    }

    this.persistCurrentTopicTimeSpent();
    this.topicTimerStartedAt = 0;
    this.updateTopicTimeSpentDisplay();
  }

  private persistCurrentTopicTimeSpent(): void {
    if (!this.topicTimerStorageId || this.topicTimerStartedAt === 0) {
      return;
    }

    this.topicTimeSpentMs += Date.now() - this.topicTimerStartedAt;
    this.topicTimerStartedAt = Date.now();
    this.storage.set(this.getTopicTimeSpentStorageKey(this.topicTimerStorageId), Math.round(this.topicTimeSpentMs));
  }

  private clearTopicTimeTrackingIfComplete(topic: Topic): void {
    if (this.task?.status === 'done') {
      return;
    }

    const topicTimerId = this.getCurrentTopicTimerId(topic);
    if (!topicTimerId) {
      return;
    }

    this.stopTopicTimeTracking();
    this.topicTimeSpentMs = 0;
    this.topicTimerStorageId = null;
    this.formattedTopicTimeSpent = this.formatTopicTimeSpent(0);
    this.storage.remove(this.getTopicTimeSpentStorageKey(topicTimerId));
  }

  private getPersistedTopicTimeSpent(topicId: number): number {
    const persistedTime = this.storage.get(this.getTopicTimeSpentStorageKey(topicId));
    return Number.isFinite(persistedTime) && persistedTime > 0 ? persistedTime : 0;
  }

  private updateTopicTimeSpentDisplay(): void {
    const currentSessionMs = this.topicTimerStartedAt > 0 ? Date.now() - this.topicTimerStartedAt : 0;
    this.formattedTopicTimeSpent = this.formatTopicTimeSpent(this.topicTimeSpentMs + currentSessionMs);
  }

  private getTopicTimeSpentStorageKey(topicId: number): string {
    return `${this.topicTimeSpentStoragePrefix}:${topicId}`;
  }

  private getCurrentTopicTimerId(topic?: Topic): number | null {
    if (this.task?.type === 'Topic' && this.task?.id) {
      return this.task.id;
    }

    return topic?.id || null;
  }

  private formatTopicTimeSpent(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${this.padTime(minutes)}:${this.padTime(seconds)}`;
    }

    return `${minutes}:${this.padTime(seconds)}`;
  }

  private padTime(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
}
