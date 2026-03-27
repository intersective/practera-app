import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatService } from '@v3/services/chat.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule } from '@ionic/angular';
import { NotificationsService } from '@v3/services/notifications.service';
import { ReviewService } from '@v3/services/review.service';
import { ActivityService } from '@v3/services/activity.service';

import { TabsPage } from './tabs.page';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;
  let reviewServiceSpy: jasmine.SpyObj<ReviewService>;
  let storageServiceSpy: jasmine.SpyObj<BrowserStorageService>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;
  let notificationsSpy: jasmine.SpyObj<NotificationsService>;
  let activityServiceSpy: jasmine.SpyObj<ActivityService>;
  let routerSpy: jasmine.SpyObj<Router>;

  let reviews$: BehaviorSubject<any>;
  let routeParams$: Subject<any>;
  let screenStatus$: BehaviorSubject<any>;
  let notification$: BehaviorSubject<any>;
  let eventStreams: { [key: string]: Subject<any> };

  const getEventStream = (key: string) => {
    if (!eventStreams[key]) {
      eventStreams[key] = new Subject<any>();
    }
    return eventStreams[key];
  };

  beforeEach(waitForAsync(() => {
    reviews$ = new BehaviorSubject<any>([]);
    routeParams$ = new Subject<any>();
    screenStatus$ = new BehaviorSubject<any>({ leftSidebarExpanded: false });
    notification$ = new BehaviorSubject<any>([]);
    eventStreams = {};

    TestBed.configureTestingModule({
      declarations: [ TabsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', [], {
            reviews$: reviews$.asObservable(),
          }),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: jasmine.createSpy(),
          }),
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', ['getChatList']),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['setPageTitle', 'getEvent'], {
            screenStatus$: screenStatus$.asObservable(),
          }),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', {
            getTodoItemFromEvent: undefined,
            getReminderEvent: of(true),
            getChatMessage: of(true),
          }, {
            notification$: notification$.asObservable(),
          }),
        },
        {
          provide: ActivityService,
          useValue: jasmine.createSpyObj('ActivityService', ['getActivity']),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: routeParams$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    reviewServiceSpy = TestBed.inject(ReviewService) as jasmine.SpyObj<ReviewService>;
    storageServiceSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    chatServiceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    notificationsSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    activityServiceSpy = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    storageServiceSpy.getUser.and.returnValue({ role: 'participant', chatEnabled: true } as any);
    chatServiceSpy.getChatList.and.returnValue(of([{ uuid: 'chat-1' }] as any));
    utilsSpy.getEvent.and.callFake((key: string) => getEventStream(key).asObservable());

    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize title and left sidebar state', () => {
    expect(utilsSpy.setPageTitle).toHaveBeenCalledWith('Practera');

    screenStatus$.next({ leftSidebarExpanded: true });
    expect(component.hasLeftSidebar).toBeTrue();
  });

  it('should keep chat tab hidden when chat is disabled for user', () => {
    storageServiceSpy.getUser.and.returnValue({ role: 'participant', chatEnabled: false } as any);

    component.ngOnInit();

    expect(component.showMessages).toBeFalse();
  });

  it('should show chat tab only when chat list has channels', () => {
    chatServiceSpy.getChatList.and.returnValue(of([] as any));

    component.ngOnInit();
    expect(component.showMessages).toBeFalse();

    chatServiceSpy.getChatList.and.returnValue(of([{ uuid: 'chat-1' }] as any));
    component.ngOnInit();
    expect(component.showMessages).toBeTrue();
  });

  it('should toggle events tab by user role', () => {
    storageServiceSpy.getUser.and.returnValue({ role: 'participant', chatEnabled: true } as any);
    routeParams$.next({});
    expect(component.showEvents).toBeTrue();

    storageServiceSpy.getUser.and.returnValue({ role: 'mentor', chatEnabled: true } as any);
    routeParams$.next({});
    expect(component.showEvents).toBeFalse();
  });

  it('should process notification events and trigger activity fetch when applicable', () => {
    const event = {
      type: 'assessment_review_published',
      meta: {
        AssessmentReview: {
          activity_id: 321,
        },
      },
    } as any;

    getEventStream('notification').next(event);

    expect(notificationsSpy.getTodoItemFromEvent).toHaveBeenCalledWith(event);
    expect(activityServiceSpy.getActivity).toHaveBeenCalledWith(321);
  });

  it('should process chat and reminder events', () => {
    getEventStream('chat:new-message').next({});
    getEventStream('chat:delete-message').next({});
    getEventStream('event-reminder').next({ id: 'reminder' });

    expect(notificationsSpy.getChatMessage).toHaveBeenCalledTimes(2);
    expect(notificationsSpy.getReminderEvent).toHaveBeenCalledWith({ id: 'reminder' });
  });

  it('should map notification badges by type', () => {
    notification$.next([
      { type: 'event-reminder' },
      { type: 'event-reminder' },
      { type: 'review_submission' },
      { type: 'chat', unreadMessages: 5 },
    ] as any);

    expect(component.badges.event).toBe(2);
    expect(component.badges.review).toBe(1);
    expect(component.badges.chat).toBe(5);

    notification$.next([{ type: 'chat' }] as any);
    expect(component.badges.chat).toBe(0);
  });

  it('should set selected tab from tabs component', () => {
    component.tabs = {
      getSelected: () => 'home',
    } as any;

    component.setCurrentTab();

    expect(component.selectedTab).toBe('home');
  });

  it('should handle keyboard navigation for tabs on enter and ignore unsupported keys', async () => {
    const preventDefault = jasmine.createSpy('preventDefault');
    const selectSpy = jasmine.createSpy('select');
    spyOn(routerSpy, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    component.tabs = { select: selectSpy } as any;

    await component.keyboardNavigateTab('home', { code: 'Enter', preventDefault } as any);
    expect(preventDefault).toHaveBeenCalled();
    expect(selectSpy).toHaveBeenCalledWith('home');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/v3/home');

    const noActionEvent = { code: 'KeyA', preventDefault: jasmine.createSpy('preventDefault') } as any;
    expect(component.keyboardNavigateTab('home', noActionEvent)).toBeUndefined();
    expect(noActionEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should return false for developer-only feature checks by default', () => {
    expect(component.forDeveloperMode('unknown-feature')).toBeFalse();
  });

  it('should unsubscribe open subscriptions on destroy', () => {
    const openSub = jasmine.createSpyObj('Subscription', ['unsubscribe'], { closed: false });
    const closedSub = jasmine.createSpyObj('Subscription', ['unsubscribe'], { closed: true });
    component.subscriptions = [openSub as any, closedSub as any];

    component.ngOnDestroy();

    expect(openSub.unsubscribe).toHaveBeenCalled();
    expect(closedSub.unsubscribe).not.toHaveBeenCalled();
  });
});
