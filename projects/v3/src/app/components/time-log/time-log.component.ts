import { ChangeDetectorRef, Component, Input, NgZone, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TimesheetService, TimesheetView } from '@v3/app/services/timesheet.service';
import { entryIsEditable, formatLoggedHours, progressLabel, todayYmd, toMinutes } from './timesheet-log';

@Component({
  standalone: false,
  selector: 'app-time-log',
  templateUrl: './time-log.component.html',
  styleUrls: ['./time-log.component.scss'],
})
export class TimeLogComponent implements OnChanges {
  @Input() assessmentId: number;

  view: TimesheetView | null = null;
  loading = false;
  error = '';
  message = '';
  entryDate = todayYmd();
  hours = 1;
  minutes = 0;
  categoryKey = '';
  note = '';
  externalName = '';
  externalEmail = '';
  useExternal = false;
  evidenceControl = new FormControl(null);

  constructor(
    private timesheets: TimesheetService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnChanges(): void {
    if (this.assessmentId) this.reload();
  }

  hoursText(total: number): string {
    return formatLoggedHours(total);
  }

  heading(): string {
    if (!this.view) return '';
    return progressLabel(this.view.approvedMinutes, this.view.config.targetMinutes);
  }

  editable(status: string): boolean {
    return entryIsEditable(status);
  }

  statusLabel(status: string): string {
    if (status === 'approved') return 'Approved';
    if (status === 'returned') return 'Returned';
    if (status === 'submitted') return 'Awaiting sign-off';
    return 'Draft';
  }

  statusColor(status: string): string {
    if (status === 'approved') return 'success';
    if (status === 'returned') return 'warning';
    if (status === 'submitted') return 'primary';
    return 'medium';
  }

  reload(): void {
    this.loading = true;
    this.error = '';
    this.timesheets.timesheet(this.assessmentId).subscribe({
      next: (view) => this.ngZone.run(() => {
        this.view = view;
        if (!this.categoryKey && view?.config?.categories?.length) {
          this.categoryKey = view.config.categories[0].key;
        }
        this.useExternal = view?.config?.signOff === 'external';
        this.loading = false;
        this.cdr.markForCheck();
      }),
      error: () => this.ngZone.run(() => {
        this.loading = false;
        this.error = 'Could not load your time log.';
        this.cdr.markForCheck();
      }),
    });
  }

  log(): void {
    if (!this.view) return;
    const minutes = toMinutes(this.hours, this.minutes);
    if (minutes < 1) {
      this.error = 'Enter how long you worked.';
      return;
    }
    const filestoreId = (this.evidenceControl.value as { filestoreId?: number } | null)?.filestoreId ?? null;
    this.error = '';
    this.timesheets.logTime({
      assessmentId: this.assessmentId,
      entryDate: this.entryDate,
      minutes,
      categoryKey: this.categoryKey,
      note: this.note,
      filestoreId,
    }).subscribe({
      next: () => {
        this.note = '';
        this.evidenceControl.setValue(null);
        this.message = 'Time logged.';
        this.reload();
      },
      error: (err) => this.ngZone.run(() => {
        this.error = err?.message || 'Could not log that time.';
        this.cdr.markForCheck();
      }),
    });
  }

  remove(id: number): void {
    this.timesheets.deleteTimeEntry(id).subscribe({
      next: () => this.reload(),
      error: () => this.ngZone.run(() => {
        this.error = 'Could not remove that entry.';
        this.cdr.markForCheck();
      }),
    });
  }

  submit(periodStart?: string): void {
    const signOff = this.view?.config.signOff;
    const input: { assessmentId: number; periodStart?: string; externalName?: string; externalEmail?: string } = {
      assessmentId: this.assessmentId,
      periodStart,
    };
    if (signOff === 'external' || (signOff === 'either' && this.useExternal)) {
      input.externalName = this.externalName.trim();
      input.externalEmail = this.externalEmail.trim();
    }
    this.timesheets.submitTimesheet(input).subscribe({
      next: () => this.ngZone.run(() => {
        this.message = signOff === 'none' ? 'Hours recorded.' : 'Sent for sign-off.';
        this.reload();
      }),
      error: (err) => this.ngZone.run(() => {
        this.error = err?.message || 'Could not submit this period.';
        this.cdr.markForCheck();
      }),
    });
  }
}
