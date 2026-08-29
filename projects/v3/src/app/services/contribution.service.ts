import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApolloService } from './apollo.service';

export interface ContributionTarget {
  userId: number;
  name: string;
  alreadyRated: boolean;
}

export interface PendingContributionRating {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  teamId: number;
  targets: ContributionTarget[];
}

export interface ContributionRatingInput {
  targetUserId: number;
  score: number | null;
  notPresent: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContributionService {
  constructor(private apolloService: ApolloService) {}

  getPendingRatings(): Observable<PendingContributionRating[]> {
    return this.apolloService
      .graphQLFetch(
        `query PendingContributionRatings {
          pendingContributionRatings {
            eventId
            eventTitle
            eventDate
            teamId
            targets {
              userId
              name
              alreadyRated
            }
          }
        }`,
      )
      .pipe(map((r: any) => r?.data?.pendingContributionRatings ?? []));
  }

  submitContributions(
    eventId: number,
    ratings: ContributionRatingInput[],
  ): Observable<{ success: boolean; message?: string }> {
    return this.apolloService
      .graphQLMutate(
        `mutation SubmitMeetingContributions($eventId: Int!, $ratings: [ContributionRatingInput!]!) {
          submitMeetingContributions(eventId: $eventId, ratings: $ratings) {
            success
            message
          }
        }`,
        { eventId, ratings },
      )
      .pipe(map((r: any) => r?.data?.submitMeetingContributions ?? { success: false }));
  }

  ensureContributionTodos(): Observable<{ created: number }> {
    return this.apolloService
      .graphQLMutate(
        `mutation EnsureContributionTodos {
          ensureContributionTodos {
            created
          }
        }`,
      )
      .pipe(map((r: any) => r?.data?.ensureContributionTodos ?? { created: 0 }));
  }
}
