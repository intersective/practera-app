import {
  Component,
  Input,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';

export interface H5pContent {
  contentUrl: string;
  librariesUrl: string;
  frameJs: string;
  frameCss: string;
}

@Component({
  standalone: false,
  selector: 'app-h5p-player',
  templateUrl: './h5p-player.component.html',
  styleUrls: ['./h5p-player.component.scss'],
})
export class H5pPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() h5p: H5pContent;
  @Input() taskId: number;
  @Input() contextId: number;

  @ViewChild('h5pContainer') containerRef: ElementRef<HTMLDivElement>;

  isLoading = true;
  error: string | null = null;
  private xapiListener: ((event: MessageEvent) => void) | null = null;

  constructor(
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.loadH5p();
  }

  private async loadH5p(): Promise<void> {
    if (!this.h5p?.contentUrl) {
      this.zone.run(() => {
        this.error = 'Failed to load H5P content.';
        this.isLoading = false;
        this.cdr.markForCheck();
      });
      return;
    }

    try {
      const { H5PStandalone } = await import('h5p-standalone');
      const el = this.containerRef.nativeElement;

      await new H5PStandalone(el, {
        h5pJsonPath: this.h5p.contentUrl,
        frameJs: this.h5p.frameJs,
        frameCss: this.h5p.frameCss,
        librariesPath: this.h5p.librariesUrl,
        contentJsonPath: `${this.h5p.contentUrl}content.json`,
      });

      this.zone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });

      this.xapiListener = (event: MessageEvent) => {
        this.zone.run(() => this.handleXapi(event));
      };
      window.addEventListener('message', this.xapiListener);
    } catch {
      this.zone.run(() => {
        this.error = 'Failed to load H5P content.';
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  private handleXapi(event: MessageEvent): void {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      const verbId = data?.verb?.id;
      if (
        verbId === 'http://adlnet.gov/expapi/verbs/completed' ||
        verbId === 'http://adlnet.gov/expapi/verbs/answered'
      ) {
        window.dispatchEvent(new CustomEvent('h5pTaskCompleted', {
          detail: { taskId: this.taskId, contextId: this.contextId },
        }));
      }
    } catch {
      // ignore malformed postMessage payloads
    }
  }

  ngOnDestroy(): void {
    if (this.xapiListener) {
      window.removeEventListener('message', this.xapiListener);
    }
  }
}
