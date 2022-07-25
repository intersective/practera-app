import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter, ViewEncapsulation, OnDestroy, OnInit } from '@angular/core';
import { FilestackService } from '@v3/app/services/filestack.service';
import { Subject, Subscription } from 'rxjs';
import { delay, repeat, takeUntil } from 'rxjs/operators';

interface FilestackConversionResponse {
  status: string;
  data: {
    url: string;
  };
}

@Component({
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

  constructor(private filestackService: FilestackService) {}

  ngOnInit(): void {
    const stillWaiting = setTimeout(() => {
      this.waitedTooLong = true;
    }, 10000);

    this.subscriptions.push(this.stop$.subscribe(res => {
      if (res === true) {
        clearTimeout(stillWaiting);
      }
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.video?.fileObject?.mimetype !== 'video/mp4') {
      this.convertVideo(this.video.fileObject);
    }
  }

  ngOnDestroy(): void {
    this.stop$.next(true);
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(subs => subs.unsubscribe());
    }
  }

  convertVideo(file) {
    this.subscriptions.push(this.filestackService.videoConversion(file.handle).pipe(
      delay(2000),
      repeat(10),
      takeUntil(this.stop$),
    ).subscribe((res: FilestackConversionResponse) => {
      this.result = res;
      if (res?.status === 'completed') {
        this.stop$.next(true);
      }
    }));
  }

  showInFilestackPreview(file: FilestackConversionResponse) {
    const downloadURL = file.data.url;
    const streamURL = this.video.fileObject.url;
    return this.filestackService.previewModal(downloadURL, {
      url: streamURL
    });
  }
}
