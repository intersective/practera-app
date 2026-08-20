import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { ApolloService } from '@v3/services/apollo.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { TeamRosterComponent } from './team-roster.component';

describe('TeamRosterComponent', () => {
  let component: TeamRosterComponent;
  let fixture: ComponentFixture<TeamRosterComponent>;
  let apolloSpy: jasmine.SpyObj<ApolloService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(waitForAsync(() => {
    apolloSpy = jasmine.createSpyObj('ApolloService', ['graphQLFetch']);
    storageSpy = jasmine.createSpyObj('BrowserStorageService', ['getUser']);

    TestBed.configureTestingModule({
      declarations: [TeamRosterComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ApolloService, useValue: apolloSpy },
        { provide: BrowserStorageService, useValue: storageSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  function createComponent(teamId: number | null, members: Array<{ userId: number; name: string; role: string; avatar?: string }> = []): void {
    storageSpy.getUser.and.returnValue({ teamId } as any);
    apolloSpy.graphQLFetch.and.returnValue(of({ data: { myTeamMembers: members } }));

    fixture = TestBed.createComponent(TeamRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent(42);

    expect(component).toBeTruthy();
    expect(component.hasTeam).toBeTrue();
  });

  it('should call myTeamMembers query when user has a team', () => {
    createComponent(42, [
      { userId: 1, name: 'Alice Example', role: 'participant', avatar: 'alice.png' },
      { userId: 2, name: 'Bob Mentor', role: 'mentor', avatar: 'bob.png' },
    ]);

    expect(apolloSpy.graphQLFetch).toHaveBeenCalledWith(jasmine.stringMatching(/myTeamMembers/));
    expect(component.members.length).toBe(2);
    expect(component.members[0].name).toBe('Alice Example');
    expect(component.members[0].role).toBe('participant');
    expect(component.members[1].name).toBe('Bob Mentor');
    expect(component.members[1].role).toBe('mentor');
  });

  it('should render member names and role labels', () => {
    createComponent(42, [
      { userId: 1, name: 'Alice Example', role: 'participant' },
      { userId: 2, name: 'Bob Mentor', role: 'mentor' },
    ]);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Alice Example');
    expect(text).toContain('Bob Mentor');
    expect(text).toContain('Learner');
    expect(text).toContain('Mentor');
  });

  it('should render empty state when no members are returned', () => {
    createComponent(42);

    expect(fixture.nativeElement.textContent).toContain('No team members found.');
  });

  it('should not load team members when user has no team', () => {
    createComponent(null);

    expect(apolloSpy.graphQLFetch).not.toHaveBeenCalled();
    expect(component.hasTeam).toBeFalse();
  });
});
