import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApolloService } from './apollo.service';

export interface MeetingPollSlot {
  id: number;
  slotStart: string;
  slotEnd: string;
  availableCount: number;
  unavailableCount: number;
  maybeCount: number;
  votes: MeetingPollVote[];
}

export interface MeetingPollVote {
  userId: number;
  userName: string | null;
  vote: 'available' | 'unavailable' | 'maybe';
}

export interface MeetingPoll {
  id: number;
  uuid: string;
  teamId: number;
  teamName: string | null;
  creatorUserId: number;
  creatorName: string | null;
  title: string;
  description: string | null;
  durationMinutes: number;
  location: string | null;
  status: 'open' | 'closed' | 'scheduled' | 'cancelled';
  deadline: string | null;
  eventId: number | null;
  selectedSlotId: number | null;
  slots: MeetingPollSlot[];
  created: string;
}

export interface CreateMeetingPollInput {
  teamId: number;
  title: string;
  description?: string;
  durationMinutes?: number;
  location?: string;
  slots: { slotStart: string; slotEnd: string }[];
  deadline?: string;
}

const POLL_FRAGMENT = `
  id uuid teamId teamName creatorUserId creatorName
  title description durationMinutes location status deadline eventId selectedSlotId created
  slots {
    id slotStart slotEnd availableCount unavailableCount maybeCount
    votes { userId userName vote }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class MeetingPollService {
  constructor(private apolloService: ApolloService) {}

  getTeamPolls(teamId: number, status?: string): Observable<MeetingPoll[]> {
    const variables: any = { teamId };
    if (status) variables.status = status;
    return this.apolloService.graphQLFetch(
      `query teamMeetingPolls($teamId: Int!, $status: String) {
        teamMeetingPolls(teamId: $teamId, status: $status) {
          ${POLL_FRAGMENT}
        }
      }`,
      { variables }
    ).pipe(map((r: any) => r?.data?.teamMeetingPolls ?? []));
  }

  createPoll(input: CreateMeetingPollInput): Observable<MeetingPoll | null> {
    return this.apolloService.graphQLFetch(
      `mutation createMeetingPoll($input: CreateMeetingPollInput!) {
        createMeetingPoll(input: $input) {
          ${POLL_FRAGMENT}
        }
      }`,
      { variables: { input } }
    ).pipe(map((r: any) => r?.data?.createMeetingPoll ?? null));
  }

  vote(slotId: number, vote: 'available' | 'unavailable' | 'maybe'): Observable<boolean> {
    return this.apolloService.graphQLFetch(
      `mutation voteMeetingPoll($slotId: Int!, $vote: String!) {
        voteMeetingPoll(slotId: $slotId, vote: $vote) {
          success
        }
      }`,
      { variables: { slotId, vote } }
    ).pipe(map((r: any) => r?.data?.voteMeetingPoll?.success === true));
  }

  cancelPoll(pollId: number): Observable<boolean> {
    return this.apolloService.graphQLFetch(
      `mutation cancelMeetingPoll($pollId: Int!) {
        cancelMeetingPoll(pollId: $pollId) {
          success
        }
      }`,
      { variables: { pollId } }
    ).pipe(map((r: any) => r?.data?.cancelMeetingPoll?.success === true));
  }
}
