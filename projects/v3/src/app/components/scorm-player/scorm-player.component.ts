import { Component, Input, OnDestroy, ElementRef, ViewChild, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';

export interface ScormContent {
  contentUrl: string;   // base URL for SCORM package (e.g., https://cdn.../scorm/pkg-id/)
  launch: string;       // relative path to launch file (e.g., index.html)
  version: 'scorm12' | 'scorm2004';
  masteryScore?: number;
  allowResume: boolean;
  assessmentId?: number;
  activityId?: string;  // IRI for xAPI
}

@Component({
  standalone: false,
  selector: 'app-scorm-player',
  templateUrl: './scorm-player.component.html',
  styleUrls: ['./scorm-player.component.scss'],
})
export class ScormPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() scorm: ScormContent;
  @Input() taskId: number;
  @Input() contextId: number;

  @ViewChild('scormFrame') frameRef: ElementRef<HTMLIFrameElement>;

  isLoading = true;
  error: string | null = null;
  isComplete = false;

  private apiAdapter: any = null;
  private messageListener: ((event: MessageEvent) => void) | null = null;

  constructor(
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.loadScorm();
  }

  private async loadScorm(): Promise<void> {
    if (!this.scorm?.contentUrl) {
      this.zone.run(() => {
        this.error = 'Failed to load SCORM content.';
        this.isLoading = false;
        this.cdr.markForCheck();
      });
      return;
    }

    try {
      const { ScormAdapter } = await import('./scorm-adapter');
      this.apiAdapter = new ScormAdapter({
        version: this.scorm.version,
        masteryScore: this.scorm.masteryScore ?? 80,
        allowResume: this.scorm.allowResume,
        assessmentId: this.scorm.assessmentId,
        activityId: this.scorm.activityId || this.scorm.contentUrl,
      });

      // Expose SCORM API on the frame window before content loads
      const frame = this.frameRef?.nativeElement;
      if (frame) {
        frame.addEventListener('load', () => {
          try {
            const fw = frame.contentWindow as any;
            if (this.scorm.version === 'scorm12') {
              fw.API = this.apiAdapter.getApi12();
            } else {
              fw.API_1484_11 = this.apiAdapter.getApi2004();
            }
          } catch {
            // cross-origin frame — API must be on parent window instead
          }
          this.zone.run(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          });
        });

        // Also expose on parent window as fallback (SCORM spec: walk up to opener)
        const win = window as any;
        if (this.scorm.version === 'scorm12') {
          win.API = this.apiAdapter.getApi12();
        } else {
          win.API_1484_11 = this.apiAdapter.getApi2004();
        }

        // Store taskId on window for adapter to pick up in postMessage
        win.__scormTaskId__ = this.taskId;

        const launchUrl = `${this.scorm.contentUrl}${this.scorm.launch}`;
        frame.src = launchUrl;
      }

      // Listen for xAPI completion events from the adapter (via postMessage)
      this.messageListener = (event: MessageEvent) => {
        this.zone.run(() => this.handleAdapterMessage(event));
      };
      window.addEventListener('message', this.messageListener);
    } catch {
      this.zone.run(() => {
        this.error = 'Failed to initialize SCORM player.';
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  private handleAdapterMessage(event: MessageEvent): void {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (data?.type === 'scormCompleted' && data?.taskId === this.taskId) {
        this.isComplete = true;
        this.cdr.markForCheck();
        window.dispatchEvent(new CustomEvent('scormTaskCompleted', {
          detail: { taskId: this.taskId, contextId: this.contextId, score: data.score },
        }));
      }
    } catch { /* ignore */ }
  }

  ngOnDestroy(): void {
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
    if (this.apiAdapter) {
      try { this.apiAdapter.finish(); } catch { /* ignore */ }
    }
    // Clean up global API
    delete (window as any).API;
    delete (window as any).API_1484_11;
    delete (window as any).__scormTaskId__;
  }
}
