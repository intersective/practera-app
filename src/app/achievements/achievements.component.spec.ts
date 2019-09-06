import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementsComponent } from './achievements.component';
import { AchievementsService } from './achievements.service';
import { Observable, of, pipe } from 'rxjs';
import { Router } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { SharedModule } from '@shared/shared.module';
/*
class Page {
  get achievementsName() {
    return this.query<HTMLElement>('h1');
  }
  get taskItems() {
    return this.queryAll<HTMLElement>('#tasks-card clickable-item');
  }
  fixture: ComponentFixture<AchievementsComponent>;

  constructor(fixture: ComponentFixture<AchievementsComponent>) {
    this.fixture = fixture;
  }
  //// query helpers ////
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }
  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}

describe('AchievementsComponent', () => {
  let component: AchievementsComponent;
  let fixture: ComponentFixture<AchievementsComponent>;
  let page: Page;
  let achievementsSpy: jasmine.SpyObj<AchievementsService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utils: UtilsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ AchievementsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        UtilsService,
        {
          provide: AchievementsService,
          useValue: jasmine.createSpyObj('AchievementsService', ['getAchievements'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementsComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    achievementsSpy = TestBed.get(AchievementsService);
    routerSpy = TestBed.get(Router);
    utils = TestBed.get(UtilsService);
  });

  const mockAchievements = {
    id: 1,
    name: 'test',
    description: 'des',
    tasks: [
      {
        id: 1,
        name: 'topic 1',
        type: 'Topic',
        loadingStatus: true
      },
      {
        id: 2,
        name: 'asmt 1',
        type: 'Assessment',
        contextId: 21,
        loadingStatus: true,
        isForTeam: false,
        dueDate: '2019-02-02',
        isOverdue: true,
        isDueToday: false
      },
    ]
  };
  const mockProgress = mockAchievements.tasks.map(t => {
    t['progress'] = 0;
    return t;
  });
  const mockAssessmentStatus = mockAchievements.tasks[1];
  mockAssessmentStatus['status'] = 'in progress';
  mockAssessmentStatus.loadingStatus = false;
  const mockEvents = [
    {
      id: 1,
      name: 'event 1',
      description: '',
      location: '',
      achievementsId: 11,
      achievementsName: 'act name 1',
      startTime: '2029-02-02',
      endTime: '2029-02-02',
      capacity: 20,
      remainingCapacity: 10,
      isBooked: false,
      singleBooking: false,
      canBook: true,
      isPast: false,
      assessment: null
    },
    {
      id: 2,
      name: 'event 2',
      description: '',
      location: '',
      achievementsId: 21,
      achievementsName: 'act name 2',
      startTime: '2029-02-02',
      endTime: '2029-02-02',
      capacity: 20,
      remainingCapacity: 10,
      isBooked: false,
      singleBooking: false,
      canBook: true,
      isPast: false,
      assessment: null
    },
    {
      id: 3,
      name: 'event 3',
      description: '',
      location: '',
      achievementsId: 31,
      achievementsName: 'act name 3',
      startTime: '2029-02-02',
      endTime: '2029-02-02',
      capacity: 20,
      remainingCapacity: 10,
      isBooked: false,
      singleBooking: false,
      canBook: true,
      isPast: false,
      assessment: null
    }
  ];
  beforeEach(() => {
    achievementsSpy.getAchievements.and.returnValue(of(mockAchievements));
    achievementsSpy.getTasksProgress.and.returnValue(of(mockProgress));
    achievementsSpy.getAssessmentStatus.and.returnValue(of(mockAssessmentStatus));
    eventSpy.getEvents.and.returnValue(of(mockEvents));
    fastFeedbackSpy.pullFastFeedback.and.returnValue(of({}));
    storageSpy.getUser.and.returnValue({
      teamId: 1
    });
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing constructor()', () => {
    it(`should call getEvents once more if an 'update-event' event triggered`, () => {
      fixture.detectChanges();
      utils.broadcastEvent('update-event', {});
      expect(eventSpy.getEvents.calls.count()).toBe(2);
    });
  });

  describe('when testing onEnter()', () => {
    it('should get correct achievements info and events', () => {
      fixture.detectChanges();
      expect(component.achievements).toEqual(mockAchievements);
      expect(achievementsSpy.getAchievements.calls.count()).toBe(1);
      expect(achievementsSpy.getTasksProgress.calls.count()).toBe(1);
      expect(achievementsSpy.getAssessmentStatus.calls.count()).toBe(1);
      expect(component.loadingAchievements).toBe(false);
      expect(page.achievementsName.innerHTML).toEqual(mockAchievements.name);
      expect(page.achievementsDescription).toBeTruthy();
      expect(page.taskItems.length).toBe(mockAchievements.tasks.length);
      page.taskNames.forEach((tN, i) => expect(tN.innerHTML).toEqual(mockAchievements.tasks[i].name));
      expect(fastFeedbackSpy.pullFastFeedback.calls.count()).toBe(1);
      expect(component.events).toEqual(mockEvents);
      expect(eventSpy.getEvents.calls.count()).toBe(1);
      // always display 2 events and a "show more"
      expect(page.eventItems.length).toBe(3);
      expect(component.loadingEvents).toBe(false);
    });
  });

  describe('when testing back()', () => {
    it('should navigate to the project page', () => {
      component.back();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'project']);
    });
  });

  describe('when testing checkAssessment()', () => {
    it('should navigate to the assessment page correctly', () => {
      fixture.detectChanges();
      component.checkAssessment({
        id: 2,
        type: 'Assessment',
        isLocked: false
      });
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['assessment', 'assessment', 1, 21, 2]);
    });

    it('should pop up locked message', () => {
      fixture.detectChanges();
      component.checkAssessment({
        id: 2,
        type: 'Assessment',
        isLocked: true,
        submitter: {
          name: 'sub',
          image: 'image'
        }
      });
      expect(notificationSpy.lockTeamAssessmentPopUp.calls.count()).toBe(1);
      expect(notificationSpy.lockTeamAssessmentPopUp.calls.first().args[0]).toEqual({
        name: 'sub',
        image: 'image'
      });
      notificationSpy.lockTeamAssessmentPopUp.calls.first().args[1]({data: true});
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['assessment', 'assessment', 1, 21, 2]);
    });
  });
  describe('when testing goto()', () => {
    it('should pop up not in team message', () => {
      storageSpy.getUser.and.returnValue({
        teamId: null
      });
      fixture.detectChanges();
      component.achievements = JSON.parse(JSON.stringify(mockAchievements));
      component.achievements.tasks[1].isForTeam = true;
      component.goto('Assessment', 2);
      expect(notificationSpy.popUp.calls.count()).toBe(1);
      expect(notificationSpy.popUp.calls.first().args[1]).toEqual({message: 'To do this assessment, you have to be in a team.'});
      expect(routerSpy.navigate.calls.count()).toBe(0);
    });

    it('should navigate to correct topic page', () => {
      component.id = 1;
      component.goto('Topic', 2);
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['topic', 1, 2]);
    });

    it('should pop up locked message', () => {
      component.goto('Locked', 2);
      expect(routerSpy.navigate.calls.count()).toBe(0);
      expect(notificationSpy.popUp.calls.count()).toBe(1);
      expect(notificationSpy.popUp.calls.first().args[1]).toEqual({message: 'This part of the app is still locked. You can unlock the features by engaging with the app and completing all tasks.'});
    });
  });
});
*/
