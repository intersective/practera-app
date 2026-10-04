import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TimesheetPeriodRow, TimesheetService } from '@v3/app/services/timesheet.service';
import { formatLoggedHours } from '@v3/app/components/time-log/timesheet-log';

@Component({
  standalone: false,
  selector: 'app-timesheet-approve',
  templateUrl: './timesheet-approve.page.html',
  styleUrls: ['./timesheet-approve.page.scss'],
})
export class TimesheetApprovePage implements OnInit {
  sheet: TimesheetPeriodRow | null = null;
  state: 'loading' | 'ready' | 'done' | 'invalid' = 'loading';
  approverName = '';
  note = '';
  error = '';
  private token = '';

  constructor(
    private route: ActivatedRoute,
    private timesheets: TimesheetService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.state = 'invalid';
      return;
    }
    this.timesheets.timesheetByToken(this.token).subscribe({
      next: (sheet) => this.ngZone.run(() => {
        this.sheet = sheet;
        this.state = sheet?.status === 'submitted' ? 'ready' : 'done';
        this.cdr.markForCheck();
      }),
      error: () => this.ngZone.run(() => {
        this.state = 'invalid';
        this.cdr.markForCheck();
      }),
    });
  }

  hours(minutes: number): string {
    return formatLoggedHours(minutes);
  }

  decide(decision: 'approve' | 'return'): void {
    if (!this.approverName.trim()) {
      this.error = 'Enter your name.';
      return;
    }
    this.error = '';
    this.timesheets.decideByToken(this.token, decision, this.approverName.trim(), this.note).subscribe({
      next: () => this.ngZone.run(() => {
        this.state = 'done';
        this.cdr.markForCheck();
      }),
      error: () => this.ngZone.run(() => {
        this.error = 'This link is no longer valid.';
        this.state = 'invalid';
        this.cdr.markForCheck();
      }),
    });
  }
}
