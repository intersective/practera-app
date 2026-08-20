import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApolloService } from '@v3/services/apollo.service';
import { BrowserStorageService } from '@v3/services/storage.service';

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

interface TeamMembersResponse {
  data: {
    teamMembers: TeamMember[];
  };
}

@Component({
  standalone: false,
  selector: 'app-team-roster',
  templateUrl: './team-roster.component.html',
  styleUrls: ['./team-roster.component.scss'],
})
export class TeamRosterComponent implements OnInit, OnDestroy {
  members: TeamMember[] = [];
  loading = false;
  hasTeam = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private apolloService: ApolloService,
    private storage: BrowserStorageService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const teamId = this.storage.getUser()?.teamId;
    this.hasTeam = typeof teamId === 'number';
    if (!this.hasTeam) {
      return;
    }
    this.loadTeamMembers();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  roleLabel(role: string): string {
    switch (role?.toLowerCase()) {
      case 'mentor':
        return $localize`Mentor`;
      case 'admin':
      case 'coordinator':
        return $localize`Coordinator`;
      case 'participant':
      case 'learner':
        return $localize`Learner`;
      default:
        return role || $localize`Member`;
    }
  }

  private loadTeamMembers(): void {
    this.loading = true;
    this.apolloService.graphQLFetch(
      `query teamMembers {
        teamMembers {
          id
          name
          role
          avatar
        }
      }`
    ).pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response: TeamMembersResponse) => {
          this.ngZone.run(() => {
            this.members = response?.data?.teamMembers || [];
            this.loading = false;
            this.cdr.markForCheck();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.members = [];
            this.loading = false;
            this.cdr.markForCheck();
          });
        },
      });
  }
}
