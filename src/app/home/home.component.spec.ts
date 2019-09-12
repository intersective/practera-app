import { CUSTOM_ELEMENTS_SCHEMA, Directive } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { HomeComponent } from './home.component';
import { Intercom } from 'ng-intercom';
import { HomeService } from './home.service';
import { FastFeedbackService } from '@app/fast-feedback/fast-feedback.service';
import { AchievementsService } from '@app/achievements/achievements.service';
import { EventsService } from '@app/events/events.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Directive({
  selector: '[routerLink], [routerLinkActive]'
})
class DummyRouterLinkDirective {}

class Page {
  // getter properties wait to query the DOM until called.
  get todoCards() {
    return this.queryAll<HTMLElement>('app-todo-card');
  }
  get title() {
    return this.query<HTMLElement>('h1');
  }
  get achievement() {
    return this.query<HTMLElement>('.achievement');
  }
  get calendarIcon() {
    return this.query<HTMLElement>('ion-icon.calendar');
  }

  navigateSpy:  jasmine.Spy;
  fixture: ComponentFixture<HomeComponent>;

  constructor(fixture: ComponentFixture<HomeComponent>) {
    // get the navigate spy from the injected router spy object
    const routerSpy = <any> fixture.debugElement.injector.get(Router);
    this.navigateSpy = routerSpy.navigate;
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

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let page: Page;
  let homeServiceSpy: jasmine.SpyObj<HomeService>;
  let eventsServiceSpy: jasmine.SpyObj<EventsService>;
  let achieventsServiceSpy: jasmine.SpyObj<AchievementsService>;
  let fastFeedbackServiceSpy: jasmine.SpyObj<FastFeedbackService>;
  let storageServiceSpy: jasmine.SpyObj<BrowserStorageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let utils: UtilsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      // imports: [RouterTestingModule],
      declarations: [HomeComponent, DummyRouterLinkDirective],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        UtilsService,
        {
          provide: Intercom
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', ['getTodoItemFromEvent', 'getReminderEvent', 'getTodoItems', 'getChatMessage', 'getProgress', 'getCurrentActivity', 'getProgramName'])
        },
        {
          provide: EventsService,
          useValue: jasmine.createSpyObj('EventsService', ['getEvents', 'eventDetailPopUp'])
        },
        {
          provide: AchievementsService,
          useValue: jasmine.createSpyObj('AchievementsService', ['getAchievements'])
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', ['pullFastFeedback'])
        },
        {
          provide: BrowserStorageService,
          // we've already used BrowserStorageService in the constructor(), so we have to mock the return data when defined
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getUser': {
              role: 'participant',
              teamId: 1,
              name: 'Test User',
              email: 'user@test.com',
              id: 1
            }
          })
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    homeServiceSpy = TestBed.get(HomeService);
    eventsServiceSpy = TestBed.get(EventsService);
    achieventsServiceSpy = TestBed.get(AchievementsService);
    fastFeedbackServiceSpy = TestBed.get(FastFeedbackService);
    storageServiceSpy = TestBed.get(BrowserStorageService);
    routerSpy = TestBed.get(Router);
    utils = TestBed.get(UtilsService);
  });

  beforeEach(() => {
    homeServiceSpy.getTodoItems.and.returnValue(of([]));
    homeServiceSpy.getChatMessage.and.returnValue(of([]));
    homeServiceSpy.getCurrentActivity.and.returnValue(of({}));
    homeServiceSpy.getProgramName.and.returnValue(of('Test Program'));
    homeServiceSpy.getProgress.and.returnValue(of(10));
    achieventsServiceSpy.getAchievements.and.returnValue(of([]));
    eventsServiceSpy.getEvents.and.returnValue(of([]));
    fastFeedbackServiceSpy.pullFastFeedback.and.returnValue(of({}));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when testing constructor()', () => {
    it('should display correct todo card with notification/team-message/event-reminder/team-no-mentor-message event(Pusher)', () => {
      // mock getTodoItems()
      homeServiceSpy.getTodoItems.and.returnValue(of([
        {
          type: 'feedback_available'
        },
        {
          type: 'review_submission'
        }
      ]));
      fixture.detectChanges();
      // before any events
      // 2 todo items
      expect(component.todoItems.length).toEqual(2);
      expect(page.todoCards.length).toBe(2);

      // mock getTodoItemFromEvent()
      homeServiceSpy.getTodoItemFromEvent.and.returnValue({
        type: 'feedback_available'
      });
      // after 'notification' triggers
      utils.broadcastEvent('notification', {});
      fixture.detectChanges();
      expect(homeServiceSpy.getTodoItemFromEvent.calls.count()).toBe(1, 'one service call');
      expect(component.todoItems.length).toEqual(3);
      expect(page.todoCards.length).toBe(3);

      // mock getChatMessage()
      homeServiceSpy.getChatMessage.and.returnValue(of({
        type: 'chat'
      }));
      // after 'team-message' triggers
      utils.broadcastEvent('team-message', {});
      fixture.detectChanges();
      // 2 calls, 1 from onEnter(), 1 from the event
      expect(homeServiceSpy.getChatMessage.calls.count()).toBe(2, '2 service call');
      // there're still 4 todo items instead of 5, because all chat messages are gathered to only 1 todo item
      expect(component.todoItems.length).toEqual(4);
      expect(page.todoCards.length).toBe(4);

      // mock getReminderEvent()
      homeServiceSpy.getReminderEvent.and.returnValue(of({
        name: 'Test Event',
      }));
      // after 'event-reminder' triggers
      utils.broadcastEvent('event-reminder', {});
      fixture.detectChanges();
      expect(homeServiceSpy.getReminderEvent.calls.count()).toBe(1, '1 service call');
      expect(component.eventReminders.length).toEqual(1, '1 event reminder');
      expect(page.todoCards.length).toBe(5);

      // after 'team-no-mentor-message' triggers
      utils.broadcastEvent('team-no-mentor-message', {});
      fixture.detectChanges();
      // 3 calls, 1 from onEnter(), 2 from the event
      expect(homeServiceSpy.getChatMessage.calls.count()).toBe(3, 'one service call');
      // todo items and todo card won't increase, because all chat messages are gathered to only 1 todo item
      expect(component.todoItems.length).toEqual(4);
      expect(page.todoCards.length).toBe(5);
    });
  });

  describe('when testing onEnter()', () => {
    it('should display no todo card if there\'s no todo item', () => {
      fixture.detectChanges();
      expect(component.todoItems).toEqual([], 'no todo item');
      expect(component.loadingTodoItems).toBe(false, 'todo item loaded');
      expect(homeServiceSpy.getTodoItems.calls.count()).toBe(1, 'one call');
      expect(page.todoCards.length).toBe(1, 'one todo card');
    });

    it('should display 2 todo cards if there\'re 2 todo items', () => {
      homeServiceSpy.getTodoItems.and.returnValue(of([
        {
          type: 'feedback_available',
          name: 'Test todo item1',
          description: 'Test description',
          time: '2019-03-02'
        },
        {
          type: 'review_submission',
          name: 'Test todo item2',
          description: 'Test description',
          time: '2019-03-03'
        }
      ]));
      fixture.detectChanges();
      expect(component.todoItems.length).toEqual(2, '2 todo items');
      expect(component.loadingTodoItems).toBe(false, 'todo item loaded');
      expect(homeServiceSpy.getTodoItems.calls.count()).toBe(1, 'one call');
      expect(page.todoCards.length).toBe(2, '2 todo cards');
    });

    it('should display 1 todo card if there\'s 1 chat message', () => {
      homeServiceSpy.getChatMessage.and.returnValue(of(
        {
          type: 'chat',
          name: 'Test chat 1',
          description: 'Test description',
          time: '2019-03-02'
        }
      ));
      fixture.detectChanges();
      expect(component.todoItems.length).toEqual(1, '1 todo item');
      expect(component.loadingTodoItems).toBe(false, 'todo item loaded');
      expect(homeServiceSpy.getChatMessage.calls.count()).toBe(1, 'one call');
      expect(page.todoCards.length).toBe(1, '1 todo card');
    });

    it('should not call getChatMessage if no team id', () => {
      storageServiceSpy.getUser.and.returnValue(
        {
          role: 'participant',
          teamId: null,
          name: 'Test User',
          email: 'user@test.com',
          id: 1
        }
      );
      fixture.detectChanges();
      expect(component.todoItems.length).toEqual(0, 'no todo item');
      expect(homeServiceSpy.getChatMessage.calls.count()).toBe(0, 'no call');
      expect(page.todoCards.length).toBe(1, '1 todo card');
    });

    it('should get the correct progress', () => {
      fixture.detectChanges();
      expect(component.progressConfig).toEqual({percent: 10});
      expect(homeServiceSpy.getProgress.calls.count()).toBe(1, 'one call');
      expect(component.loadingProgress).toBe(false, 'progress loaded');
    });

    it('should get the correct current activity', () => {
      const mock = {
        id: 1,
        name: 'Test activity',
        isLocked: false,
        leadImage: ''
      };
      homeServiceSpy.getCurrentActivity.and.returnValue(of(mock));
      fixture.detectChanges();
      expect(component.activity).toEqual(mock, 'activity match');
      expect(homeServiceSpy.getCurrentActivity.calls.count()).toBe(1, 'one call');
      expect(component.loadingActivity).toBe(false, 'activity loaded');
    });

    it('should display the correct program name', () => {
      fixture.detectChanges();
      expect(component.programName).toEqual('Test Program');
      expect(homeServiceSpy.getProgramName.calls.count()).toBe(1, 'one call');
      expect(page.title.innerHTML).toEqual('Test Program', 'program name match');
    });

    it('should not display achievement if there\'s no achievement', () => {
      fixture.detectChanges();
      expect(component.achievements).toEqual([], 'no achievement');
      expect(achieventsServiceSpy.getAchievements.calls.count()).toBe(1, 'one call');
      expect(page.achievement).toBeFalsy();
    });

    it('should display all achievements if there\'re less than 4 achievements', () => {
      const mock = [
        {
          id: 1,
          name: 'Test achievement1',
          description: '',
          isEarned: false,
        },
        {
          id: 2,
          name: 'Test achievement1',
          description: '',
          isEarned: true,
        }
      ];
      achieventsServiceSpy.getAchievements.and.returnValue(of(mock));
      fixture.detectChanges();
      expect(component.achievements).toEqual(mock, 'no achievement');
      expect(achieventsServiceSpy.getAchievements.calls.count()).toBe(1, 'one call');
      expect(page.achievement).toBeTruthy();
      expect(page.achievement.textContent).toContain('My Badges');
    });

    it('should display first 3 achievements if all achievements are unearned', () => {
      const expected = [
        {
          id: 1,
          name: 'Test achievement1',
          description: '',
          isEarned: false,
        },
        {
          id: 2,
          name: 'Test achievement2',
          description: '',
          isEarned: false,
        },
        {
          id: 3,
          name: 'Test achievement3',
          description: '',
          isEarned: false,
        }
      ];
      const mock = [
        ...expected,
        {
          id: 4,
          name: 'Test achievement4',
          description: '',
          isEarned: false,
        }
      ];
      achieventsServiceSpy.getAchievements.and.returnValue(of(mock));
      fixture.detectChanges();
      expect(component.achievements).toEqual(expected, 'first 3 achievement');
    });

    it('should display first 3 achievements if all achievements are earned', () => {
      const expected = [
        {
          id: 1,
          name: 'Test achievement1',
          description: '',
          isEarned: true,
        },
        {
          id: 2,
          name: 'Test achievement2',
          description: '',
          isEarned: true,
        },
        {
          id: 3,
          name: 'Test achievement3',
          description: '',
          isEarned: true,
        }
      ];
      const mock = [
        ...expected,
        {
          id: 4,
          name: 'Test achievement4',
          description: '',
          isEarned: true,
        }
      ];
      achieventsServiceSpy.getAchievements.and.returnValue(of(mock));
      fixture.detectChanges();
      expect(component.achievements).toEqual(expected, 'first 3 achievement');
    });

    it('should display 1 earned and two unearned achievements if there\'s only one earned achievement', () => {
      const expected = [
        {
          id: 1,
          name: 'Test achievement1',
          description: '',
          isEarned: true,
        },
        {
          id: 2,
          name: 'Test achievement2',
          description: '',
          isEarned: false,
        },
        {
          id: 3,
          name: 'Test achievement3',
          description: '',
          isEarned: false,
        }
      ];
      const mock = [
        ...expected,
        {
          id: 4,
          name: 'Test achievement4',
          description: '',
          isEarned: false,
        }
      ];
      achieventsServiceSpy.getAchievements.and.returnValue(of(mock));
      fixture.detectChanges();
      expect(component.achievements).toEqual(expected);
    });

    it('should display 2 earned and 1 unearned achievements if there\'re more than one earned achievement', () => {
      const expected = [
        {
          id: 1,
          name: 'Test achievement1',
          description: '',
          isEarned: true,
        },
        {
          id: 2,
          name: 'Test achievement2',
          description: '',
          isEarned: true,
        },
        {
          id: 3,
          name: 'Test achievement3',
          description: '',
          isEarned: false,
        }
      ];
      const mock = [
        ...expected,
        {
          id: 4,
          name: 'Test achievement4',
          description: '',
          isEarned: true,
        },
        {
          id: 5,
          name: 'Test achievement5',
          description: '',
          isEarned: false,
        }
      ];
      achieventsServiceSpy.getAchievements.and.returnValue(of(mock));
      fixture.detectChanges();
      expect(component.achievements).toEqual(expected);
    });

    it('should not display event icon if there\'s no event', () => {
      fixture.detectChanges();
      expect(component.haveEvents).toBeFalsy();
      expect(eventsServiceSpy.getEvents.calls.count()).toBe(1, 'one call');
      expect(page.calendarIcon).toBeFalsy();
    });

    it('should display event icon if there\'s event', () => {
      eventsServiceSpy.getEvents.and.returnValue(of([{id: 1}]));
      fixture.detectChanges();
      expect(component.haveEvents).toBe(true);
      expect(eventsServiceSpy.getEvents.calls.count()).toBe(1, 'one call');
      expect(page.calendarIcon).toBeTruthy();
    });
  });

  describe('when testing goToActivity()', () => {
    it('should navigate to the correct activity page', () => {
      component.goToActivity(1);
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'activity', 1]);
    });
  });

  describe('when testing goToAssessment()', () => {
    it('should navigate to the correct assessment page', () => {
      component.goToAssessment(1, 2, 3);
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['assessment', 'assessment', 1, 2, 3]);
    });
  });

  describe('when testing goToReview()', () => {
    it('should navigate to the correct review page', () => {
      component.goToReview(1, 2, 3);
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['assessment', 'review', 1, 2, 3]);
    });
  });

  describe('when testing goToChat()', () => {
    it('should navigate to the correct chat page #1', () => {
      component.goToChat({
        meta: null
      });
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'chat']);
    });

    it('should navigate to the correct chat page #2', () => {
      component.goToChat({
        meta: {
          team_id: 2,
          team_member_id: 1
        }
      });
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['chat', 'chat-room', 2, 1]);
    });

    it('should navigate to the correct chat page #3', () => {
      component.goToChat({
        meta: {
          team_id: 2,
          participants_only: true
        }
      });
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['chat', 'chat-room', 'team', 2, true]);
    });
  });
});
