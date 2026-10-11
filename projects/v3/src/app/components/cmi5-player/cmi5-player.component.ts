import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { TopicService } from '../../services/topic.service';

@Component({
  standalone: false,
  selector: 'app-cmi5-player',
  templateUrl: './cmi5-player.component.html',
  styleUrls: ['./cmi5-player.component.scss'],
})
export class Cmi5PlayerComponent implements OnInit, OnDestroy {
  @Input() assessmentId: number | null;
  @Input() activityId: string | null;
  @Input() taskId: number;
  @Input() contextId: number;

  launchUrl: SafeResourceUrl | null = null;
  error: string | null = null;
  isLoading = true;
  private xapiListener: ((event: MessageEvent) => void) | null = null;
  private markedComplete = false;

  constructor(
    private topic: TopicService,
    private sanitizer: DomSanitizer,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.assessmentId || !this.activityId) {
      this.fail('This cmi5 activity has no launch address.');
      return;
    }
    try {
      const url = await firstValueFrom(this.topic.launchCmi5(this.assessmentId, this.activityId));
      if (!url) {
        this.fail('This cmi5 activity has no launch address.');
        return;
      }
      this.zone.run(() => {
        this.launchUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.isLoading = false;
        this.cdr.markForCheck();
      });
      this.xapiListener = (event: MessageEvent) => this.forwardStatement(event);
      window.addEventListener('message', this.xapiListener);
    } catch {
      this.fail('This cmi5 activity could not be launched.');
    }
  }

  private fail(message: string): void {
    this.zone.run(() => {
      this.error = message;
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  private forwardStatement(event: MessageEvent): void {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      const fromBridge = data?.type === 'cmi5XapiStatements'
        || (data?.type === 'scormXapiStatements' && data?.activitySource === 'cmi5');
      const statements = fromBridge && Array.isArray(data.statements)
        ? data.statements
        : (data?.verb?.id || data?.statement?.verb?.id ? [data.statement ?? data] : []);
      if (statements.length === 0) return;
      if (!fromBridge) {
        window.postMessage({
          type: 'cmi5XapiStatements',
          statements,
          taskId: this.taskId,
          assessmentId: this.assessmentId ?? undefined,
          activitySource: 'cmi5',
        }, '*');
      }
      const done = statements.some((statement) => {
        const verbId = statement?.verb?.id ?? '';
        return verbId.endsWith('/completed') || verbId.endsWith('/passed');
      });
      if (done && !this.markedComplete) {
        this.markedComplete = true;
        window.dispatchEvent(new CustomEvent('h5pTaskCompleted', {
          detail: { taskId: this.taskId, contextId: this.contextId },
        }));
      }
    } catch {
      // ignore malformed postMessage payloads
    }
  }

  ngOnDestroy(): void {
    if (this.xapiListener) window.removeEventListener('message', this.xapiListener);
  }
}
