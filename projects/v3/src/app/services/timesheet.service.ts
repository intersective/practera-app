import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApolloService } from './apollo.service';

export interface MyTimesheetSummary {
  assessmentId: number;
  name: string;
  period: string;
  signOff: string;
  targetMinutes: number | null;
  approvedMinutes: number;
  pendingMinutes: number;
  activityId: number | null;
}

export interface TimeEntryRow {
  id: number;
  entryDate: string;
  minutes: number;
  categoryKey: string;
  categoryLabel: string;
  note: string | null;
  filestoreId: number | null;
  status: string;
}

export interface TimesheetPeriodRow {
  id: number;
  periodStart: string;
  periodEnd: string;
  totalMinutes: number;
  status: string;
  approverType: string;
  externalName: string | null;
  decisionNote: string | null;
  learnerName?: string;
  assessmentName?: string;
  programName?: string | null;
  entries: TimeEntryRow[];
}

export interface TimesheetView {
  assessmentId: number;
  name: string;
  config: {
    categories: { key: string; label: string; targetMinutes: number | null }[];
    targetMinutes: number | null;
    period: string;
    signOff: string;
    requireEvidence: boolean;
    requireNote: boolean;
  };
  entries: TimeEntryRow[];
  periods: TimesheetPeriodRow[];
  approvedMinutes: number;
  pendingMinutes: number;
  draftMinutes: number;
}

const VIEW = `
  assessmentId name
  config { categories { key label targetMinutes } targetMinutes period signOff requireEvidence requireNote }
  entries { id entryDate minutes categoryKey categoryLabel note filestoreId status }
  periods { id periodStart periodEnd totalMinutes status approverType externalName decisionNote }
  approvedMinutes pendingMinutes draftMinutes
`;

@Injectable({ providedIn: 'root' })
export class TimesheetService {
  constructor(private apollo: ApolloService) {}

  myTimesheets() {
    return this.apollo.graphQLFetch(`query { myTimesheets {
      assessmentId name period signOff targetMinutes approvedMinutes pendingMinutes activityId
    } }`).pipe(map(res => (res?.data?.myTimesheets ?? []) as MyTimesheetSummary[]));
  }

  timesheet(assessmentId: number) {
    return this.apollo.graphQLFetch(
      `query timesheet($assessmentId: Int!) { timesheet(assessmentId: $assessmentId) { ${VIEW} } }`,
      { variables: { assessmentId } },
    ).pipe(map(res => res?.data?.timesheet as TimesheetView));
  }

  logTime(input: { assessmentId: number; entryDate: string; minutes: number; categoryKey: string; note?: string; filestoreId?: number | null }) {
    return this.apollo.graphQLMutate(
      `mutation logTime($input: LogTimeInput!) { logTime(input: $input) { id status minutes } }`,
      { input },
    );
  }

  deleteTimeEntry(id: number) {
    return this.apollo.graphQLMutate(
      `mutation deleteTimeEntry($id: Int!) { deleteTimeEntry(id: $id) }`,
      { id },
    );
  }

  submitTimesheet(input: {
    assessmentId: number;
    periodStart?: string;
    externalName?: string;
    externalEmail?: string;
  }) {
    return this.apollo.graphQLMutate(
      `mutation submitTimesheet($input: SubmitTimesheetInput!) { submitTimesheet(input: $input) { id status totalMinutes } }`,
      { input },
    );
  }

  timesheetsToApprove() {
    return this.apollo.graphQLFetch(`query { timesheetsToApprove {
      id assessmentName learnerName programName periodStart periodEnd totalMinutes status decisionNote
      entries { id entryDate minutes categoryLabel note status }
    } }`).pipe(map(res => (res?.data?.timesheetsToApprove ?? []) as TimesheetPeriodRow[]));
  }

  decideTimesheet(id: number, decision: 'approve' | 'return', note?: string) {
    return this.apollo.graphQLMutate(
      `mutation decideTimesheet($input: DecideTimesheetInput!) { decideTimesheet(input: $input) { id status } }`,
      { input: { id, decision, note } },
    );
  }

  timesheetByToken(token: string) {
    return this.apollo.graphQLFetch(
      `query timesheetByToken($token: String!) { timesheetByToken(token: $token) {
        learnerName programName assessmentName periodStart periodEnd totalMinutes status
        entries { entryDate minutes categoryLabel note }
      } }`,
      { variables: { token } },
    ).pipe(map(res => res?.data?.timesheetByToken as TimesheetPeriodRow));
  }

  decideByToken(token: string, decision: 'approve' | 'return', approverName: string, note?: string) {
    return this.apollo.graphQLMutate(
      `mutation decideTimesheetByToken($input: DecideTimesheetByTokenInput!) {
        decideTimesheetByToken(input: $input) { status }
      }`,
      { input: { token, decision, approverName, note } },
    );
  }
}
