import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ActivityComponent } from './activity.component';
import { ActivityService } from './activity.service';
import { Observable, of, pipe } from 'rxjs';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { SharedModule } from '@shared/shared.module';
import { FastFeedbackService } from '@app/fast-feedback/fast-feedback.service';
import { EventListService } from '@app/event-list/event-list.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { MockRouter } from '@testing/mocked.service';

class Page {
  get activityName() {
    return this.query<HTMLElement>('h1');
  }
  get activityDescription() {
    return this.query<HTMLElement>('app-description');
  }
  get taskItems() {
    return this.queryAll<HTMLElement>('#tasks-card clickable-item');
  }
  get taskNames() {
    return this.queryAll<HTMLElement>('#tasks-card clickable-item h4');
  }
  get eventItems() {
    return this.queryAll<HTMLElement>('#events-card clickable-item');
  }
  fixture: ComponentFixture<ActivityComponent>;

  constructor(fixture: ComponentFixture<ActivityComponent>) {
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

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;
  let page: Page;
  let activitySpy: jasmine.SpyObj<ActivityService>;
  let fastFeedbackSpy: jasmine.SpyObj<FastFeedbackService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeStub: Partial<ActivatedRoute>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let eventSpy: jasmine.SpyObj<EventListService>;
  let utils: UtilsService;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, SharedModule, BrowserAnimationsModule],
      declarations: [ ActivityComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        NewRelicService,
        UtilsService,
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', ['getActivity'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['lockTeamAssessmentPopUp', 'popUp'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser'])
        },
        {
          provide: Router,
          useClass: MockRouter,
          /*useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }*/
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 1 })
            }
          }
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', ['pullFastFeedback'])
        },
        {
          provide: EventListService,
          useValue: jasmine.createSpyObj('EventListService', ['getEvents', 'isNotActionable', 'timeDisplayed'])
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    activitySpy = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    routeStub = TestBed.inject(ActivatedRoute);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    utils = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    fastFeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
    eventSpy = TestBed.inject(EventListService) as jasmine.SpyObj<EventListService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  const mockActivity = {
    id: 1,
    name: 'test',
    description: 'des',
    tasks: [
      {
        id: 1,
        name: 'topic 1',
        type: 'Topic',
        status: 'done'
      },
      {
        id: 2,
        name: 'asmt 1',
        type: 'Assessment',
        contextId: 21,
        isForTeam: false,
        dueDate: '2019-02-02',
        isOverdue: true,
        isDueToday: false,
        status: 'in progress',
        isLocked: false
      },
    ]
  };
  const mockEvents = [
    {
      id: 1,
      name: 'event 1',
      description: '',
      location: '',
      activityId: 11,
      activityName: 'act name 1',
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
      activityId: 21,
      activityName: 'act name 2',
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
      activityId: 31,
      activityName: 'act name 3',
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
    activitySpy.getActivity.and.returnValue(of(mockActivity));
    eventSpy.getEvents.and.returnValue(of(mockEvents));
    eventSpy.isNotActionable.and.returnValue(false);
    eventSpy.timeDisplayed.and.returnValue('');
    fastFeedbackSpy.pullFastFeedback.and.returnValue(of({}));
    storageSpy.getUser.and.returnValue({
      teamId: 1
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing constructor()', () => {
    it(`should call getEvents once more if an 'update-event' event triggered`, () => {
      utils.broadcastEvent('update-event', {});
      component.onEnter();
      expect(eventSpy.getEvents.calls.count()).toBe(2);
      expect(component.events.length).toBeGreaterThan(0);
    });
  });

  describe('when testing onEnter()', () => {
    it('should get correct activity info and events', () => {
      component.onEnter();
      fixture.detectChanges();
      expect(component.activity).toEqual(mockActivity);
      expect(activitySpy.getActivity.calls.count()).toBe(1);
      expect(component.loadingActivity).toBe(false);
      expect(page.activityName.innerHTML).toEqual(mockActivity.name);
      expect(page.activityDescription).toBeTruthy();
      expect(page.taskItems.length).toBe(mockActivity.tasks.length);
      page.taskNames.forEach((tN, i) => expect(tN.innerHTML).toEqual(mockActivity.tasks[i].name));
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
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'home']);
    });
  });

  describe('when testing goto()', () => {
    it('should navigate to the assessment page correctly', () => {
      component.id = 1;
      component.navigate.subscribe(event =>
        expect(event).toEqual({
          type: 'assessment',
          contextId: 21,
          assessmentId: 2
        })
      );
      component.goto({
        id: 2,
        type: 'Assessment',
        isLocked: false,
        contextId: 21
      });
    });

    it('should pop up locked message', () => {
      component.id = 1;
      component.goto({
        id: 2,
        type: 'Assessment',
        isLocked: true,
        contextId: 21,
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
      component.navigate.subscribe(event =>
        expect(event).toEqual({
          type: 'assessment',
          contextId: 21,
          assessmentId: 2
        })
      );
      notificationSpy.lockTeamAssessmentPopUp.calls.first().args[1]({data: true});
    });

    it('should pop up not in team message', () => {
      storageSpy.getUser.and.returnValue({
        teamId: null
      });
      component.goto({
        id: 2,
        type: 'Assessment',
        isForTeam: true,
        isLocked: false
      });
      expect(notificationSpy.popUp.calls.count()).toBe(1);
      expect(notificationSpy.popUp.calls.first().args[1]).toEqual({message: 'To do this assessment, you have to be in a team.'});
      expect(routerSpy.navigate.calls.count()).toBe(0);
    });

    it('should navigate to correct topic page', () => {
      component.id = 1;
      component.navigate.subscribe(event =>
        expect(event).toEqual({
          type: 'topic',
          topicId: 2
        })
      );
      component.goto({
        id: 2,
        type: 'Topic'
      });
    });

    it('should pop up locked message', () => {
      component.goto({
        id: 2,
        type: 'Locked'
      });
      expect(routerSpy.navigate.calls.count()).toBe(0);
      expect(notificationSpy.popUp.calls.count()).toBe(1);
      expect(notificationSpy.popUp.calls.first().args[1]).toEqual({message: 'This part of the app is still locked. You can unlock the features by engaging with the app and completing all tasks.'});
    });
  });
});
