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
  @Input() assessmentId: number | undefined;

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
      const loaded: any = await import('h5p-standalone');
      const exported = loaded.H5PStandalone ?? loaded.default ?? loaded;
      const Player = typeof exported === 'function' ? exported : exported.H5P;
      const el = this.containerRef.nativeElement;

      const root = this.h5p.contentUrl.replace(/\/$/, '');
      const libraries = this.h5p.librariesUrl.replace(/\/$/, '');
      await new Player(el, {
        h5pJsonPath: root,
        frameJs: this.h5p.frameJs,
        frameCss: this.h5p.frameCss,
        librariesPath: libraries,
        contentJsonPath: `${root}/content`,
      });

      this.zone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });

      this.xapiListener = (event: MessageEvent) => {
        this.zone.run(() => this.handleXapi(event));
      };
      window.addEventListener('message', this.xapiListener);
    } catch (err) {
      this.zone.run(() => {
        this.error = err instanceof Error ? err.message : 'Failed to load H5P content.';
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  private handleXapi(event: MessageEvent): void {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!data?.verb?.id) return;
      const verbId: string = data.verb.id;

      // Forward all statements for LRS storage
      window.postMessage({
        type: 'h5pXapiStatements',
        statements: [data],
        taskId: this.taskId,
        assessmentId: this.assessmentId ?? undefined,
        activitySource: 'h5p',
      }, '*');

      // Fire completion event for UI updates
      if (
        verbId === 'http://adlnet.gov/expapi/verbs/completed' ||
        verbId === 'http://adlnet.gov/expapi/verbs/answered'
      ) {
        window.dispatchEvent(new CustomEvent('h5pTaskCompleted', {
          detail: { taskId: this.taskId, contextId: this.contextId, score: data.result?.score?.raw ?? null },
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
