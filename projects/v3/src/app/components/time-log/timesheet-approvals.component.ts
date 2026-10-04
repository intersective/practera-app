import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { TimesheetPeriodRow, TimesheetService } from '@v3/app/services/timesheet.service';
import { formatLoggedHours } from './timesheet-log';

@Component({
  standalone: false,
  selector: 'app-timesheet-approvals',
  templateUrl: './timesheet-approvals.component.html',
  styleUrls: ['./time-log.component.scss'],
})
export class TimesheetApprovalsComponent implements OnInit {
  sheets: TimesheetPeriodRow[] = [];
  notes: Record<number, string> = {};
  error = '';

  constructor(
    private timesheets: TimesheetService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  hours(minutes: number): string {
    return formatLoggedHours(minutes);
  }

  reload(): void {
    this.timesheets.timesheetsToApprove().subscribe({
      next: (sheets) => this.ngZone.run(() => {
        this.sheets = sheets;
        this.cdr.markForCheck();
      }),
      error: () => this.ngZone.run(() => {
        this.sheets = [];
        this.cdr.markForCheck();
      }),
    });
  }

  decide(id: number, decision: 'approve' | 'return'): void {
    this.error = '';
    this.timesheets.decideTimesheet(id, decision, this.notes[id]).subscribe({
      next: () => this.reload(),
      error: () => this.ngZone.run(() => {
        this.error = 'Could not record that decision.';
        this.cdr.markForCheck();
      }),
    });
  }
}
