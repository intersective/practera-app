import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { FilePreviewService } from '@v3/app/services/file-preview.service';
import { Subject, Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-video-conversion',
  templateUrl: 'video-conversion.component.html',
  styleUrls: ['video-conversion.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class VideoConversionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() video?;
  @Output() preview = new EventEmitter();
  result = null;
  stop$: Subject<boolean> = new Subject<boolean>();
  subscriptions: Subscription[] = [];
  waitedTooLong: boolean = false;

  constructor(private filePreviewService: FilePreviewService) {}

  ngOnInit(): void {
    // no-op: conversion polling removed
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.video?.fileObject?.mimetype !== 'video/mp4') {
      // server-side video conversion no longer available — show download fallback immediately
      this.waitedTooLong = true;
    }
  }

  ngOnDestroy(): void {
    this.stop$.next(true);
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(subs => subs.unsubscribe());
    }
  }

  showPreview(file: { data?: { url: string } }, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    const downloadURL = file.data?.url;
    const streamURL = this.video?.fileObject?.url;
    return this.filePreviewService.openModal(downloadURL, {
      url: streamURL
    });
  }
}
