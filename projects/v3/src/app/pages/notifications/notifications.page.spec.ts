import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, waitForAsync } from '@angular/core/testing';
import { DefaultUrlSerializer, Router } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule, ModalController } from '@ionic/angular/lazy';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';
import { HomeService } from '@v3/services/home.service';
import { UnlockIndicatorService } from '@v3/services/unlock-indicator.service';

import { NotificationsPage } from './notifications.page';
import { of } from 'rxjs';
import { MockRouter } from '@testingv3/mocked.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Title } from '@angular/platform-browser';

describe('NotificationsPage', () => {
  let component: NotificationsPage;
  let fixture: ComponentFixture<NotificationsPage>;
  let routerSpy: Router;
  let utilsSpy: UtilsService;
  let modalSpy: ModalController;
  let notificationSpy: NotificationsService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsPage ],
      imports: [IonicModule.forRoot(), NoopAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', [
            'modal',
            'alert',
            'presentToast',
            'getCurrentTodoItems',
            'getTodoItems',
            'markTodoItemAsDone',
            'markMultipleTodoItemsAsDone',
          ], {
            'notification$': of(true),
            'eventReminder$': of(true),
          }),
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', ['getMilestones'], {
            'milestones$': of([]),
          }),
        },
        {
          provide: UnlockIndicatorService,
          useValue: jasmine.createSpyObj('UnlockIndicatorService', ['clearAllTasks'], {
            'unlockedTasks$': of([]),
          }),
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPage);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    utilsSpy = TestBed.inject(UtilsService);
    modalSpy = jasmine.createSpyObj('ModalController', {
      dismiss: Promise.resolve(true),
      getTop: Promise.resolve(true),
    });
    (component as any).modalController = modalSpy;
    (routerSpy as any).lastSuccessfulNavigation = () => null;
    (routerSpy as any).parseUrl = (url: string) => new DefaultUrlSerializer().parse(url);
    (routerSpy as any).navigateByUrl = jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve(true));
    notificationSpy = TestBed.inject(NotificationsService);

    // reconfigure getTop to return truthy (global test.ts override sets it to null)
    (modalSpy.getTop as jasmine.Spy).and.returnValue(Promise.resolve(true));

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    for (const title of ['Local Test Experience', 'Events - Practera', 'Peer feedback']) {
      it(`preserves ${title} when Notifications is a drawer`, () => {
        const titleService = TestBed.inject(Title);
        const originalTitle = titleService.getTitle();
        (utilsSpy.setPageTitle as jasmine.Spy).and.callFake(value => titleService.setTitle(value));
        titleService.setTitle(title);
        component.mode = 'modal';
        try {
          component.ngOnInit();
          expect(titleService.getTitle()).toBe(title);
          component.ngOnDestroy();
          expect(titleService.getTitle()).toBe(title);
        } finally {
          titleService.setTitle(originalTitle);
        }
      });
    }

    it('uses the Notifications title for a routed page', () => {
      const titleService = TestBed.inject(Title);
      const originalTitle = titleService.getTitle();
      (utilsSpy.setPageTitle as jasmine.Spy).and.callFake(value => titleService.setTitle(value));
      try {
        titleService.setTitle('Events - Practera');
        component.ngOnInit();
        expect(titleService.getTitle()).toBe('Notifications - Practera');
      } finally {
        titleService.setTitle(originalTitle);
      }
    });

    it('should initiate subscriptions', () => {
      utilsSpy.isEmpty = jasmine.createSpy('isEmpty').and.returnValue(false);
      component.ngOnInit();

      // notification$ emits true, which sets todoItems
      expect(component.todoItems).toEqual(true as any);
      // eventReminder$ emits true, isEmpty returns false, so it gets pushed
      expect(component.eventReminders).toContain(true);
    });
  });

  describe('showEventDetail()', () => {
    it('should go to event page', () => {
      component.showEventDetail({ id: 1 } as any);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'events', {
        event_id: 1,
      }]);
    });

    it('should show modal in mobile view', () => {
      utilsSpy.isMobile = jasmine.createSpy('isMobile').and.returnValue(true);
      component.showEventDetail({ id: 1 } as any);
      expect(notificationSpy.modal).toHaveBeenCalled();
    });
  });

  describe('timeFormatter()', () => {
    it('should format time with UtilsService', () => {
      component.timeFormatter('abcdefg');
      expect(utilsSpy.timeFormatter).toHaveBeenCalledWith('abcdefg');
    });
  });

  describe('clickTodoItem()', () => {
    it('should go to assessment', fakeAsync(() => {
      component.goToAssessment = spyOn(component, 'goToAssessment');
      component.clickTodoItem({
        meta: {
          activity_id: 1,
          context_id: 2,
          assessment_id: 3,
          assessment_submission_id: 4,
        },
        type: 'feedback_available',
        // type: 'assessment_submission_reminder',
        // type: '', // default
      } as any);

      flushMicrotasks();

      expect(component.goToAssessment).toHaveBeenCalled();
      expect(modalSpy.dismiss).toHaveBeenCalled();
    }));

    it('should go to review', fakeAsync(() => {
      component.goToReview = spyOn(component, 'goToReview');
      component.clickTodoItem({
        meta: {
          activity_id: 1,
          context_id: 2,
          assessment_id: 3,
          assessment_submission_id: 4,
        },
        type: 'review_submission',
      } as any);

      flushMicrotasks();

      expect(component.goToReview).toHaveBeenCalled();
      expect(modalSpy.dismiss).toHaveBeenCalled();
    }));

    it('should go to chat', fakeAsync(() => {
      component.goToChat = spyOn(component, 'goToChat');
      component.clickTodoItem({
        meta: {
          activity_id: 1,
          context_id: 2,
          assessment_id: 3,
          assessment_submission_id: 4,
        },
        type: 'chat',
      } as any);

      flushMicrotasks();

      expect(component.goToChat).toHaveBeenCalled();
      expect(modalSpy.dismiss).toHaveBeenCalled();
    }));

    it('should go to assessment (submission reminder)', fakeAsync(() => {
      component.goToAssessment = spyOn(component, 'goToAssessment');
      component.clickTodoItem({
        meta: {
          activity_id: 1,
          context_id: 2,
          assessment_id: 3,
          assessment_submission_id: 4,
        },
        type: 'assessment_submission_reminder',
      } as any);

      flushMicrotasks();

      expect(component.goToAssessment).toHaveBeenCalled();
      expect(modalSpy.dismiss).toHaveBeenCalled();
    }));

    it('should by default, go to show event detail', fakeAsync(() => {
      component.showEventDetail = spyOn(component, 'showEventDetail');
      component.clickTodoItem({
        meta: {
          activity_id: 1,
          context_id: 2,
          assessment_id: 3,
          assessment_submission_id: 4,
        },
        type: 'any other type',
      } as any);

      flushMicrotasks();

      expect(component.showEventDetail).toHaveBeenCalled();
      expect(modalSpy.dismiss).toHaveBeenCalled();
    }));
});

  describe('goToReview()', () => {
    it('should go to review page', fakeAsync(() => {
      utilsSpy.isMobile = jasmine.createSpy('isMobile').and.returnValue(false);

      const submissionId = 3;
      component.goToReview(1, 2, submissionId);

      flushMicrotasks();

      expect(routerSpy.navigate).toHaveBeenCalledWith([
        'v3',
        'review-desktop',
        submissionId
      ]);
      expect(modalSpy.dismiss).toHaveBeenCalled();
    }));
  });

  describe('goToChat()', () => {
    it('should navigate to v3/messages', () => {
      component.goToChat();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'messages']);
    });
  });

  describe('goBack()', () => {
    it('should dismiss notification modal', () => {
      component.mode = 'modal';
      utilsSpy.isMobile = jasmine.createSpy('isMobile').and.returnValue(false);
      component.goBack();

      expect(modalSpy.dismiss).toHaveBeenCalled();
    });

    for (const mobile of [false, true]) {
      it(`returns a direct Notifications page to Home (mobile=${mobile})`, async () => {
        utilsSpy.isMobile = jasmine.createSpy('isMobile').and.returnValue(mobile);
        component.window = { history: { length: 1, back: jasmine.createSpy('back') } };
        await component.goBack();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'home'], { replaceUrl: true });
        expect(modalSpy.dismiss).not.toHaveBeenCalled();
        expect(component.window.history.back).not.toHaveBeenCalled();
      });

      it(`returns to the recorded in-app destination (mobile=${mobile})`, async () => {
        utilsSpy.isMobile = jasmine.createSpy('isMobile').and.returnValue(mobile);
        (routerSpy as any).lastSuccessfulNavigation = () => ({ previousNavigation: { id: 1 } });
        component.window = { history: {
          length: 2,
          state: { notificationsReturnUrl: '/v3/activity-mobile/11?view=feedback#answer' },
          back: jasmine.createSpy('back'),
        } };
        await component.goBack();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/v3/activity-mobile/11?view=feedback#answer', { replaceUrl: true });
        expect(component.window.history.back).not.toHaveBeenCalled();
        expect(modalSpy.dismiss).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      });
    }

    it('falls back to Home if redirect navigation has no browser history entry', async () => {
      (routerSpy as any).lastSuccessfulNavigation = () => ({ previousNavigation: { id: 1 } });
      component.window = { history: { length: 1, back: jasmine.createSpy('back') } };
      await component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'home'], { replaceUrl: true });
      expect(component.window.history.back).not.toHaveBeenCalled();
    });

    it('does not return direct entry to unrelated browser history', async () => {
      component.window = { history: { length: 3, back: jasmine.createSpy('back') } };
      await component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'home'], { replaceUrl: true });
      expect(component.window.history.back).not.toHaveBeenCalled();
    });

    it('returns a cached direct entry to Home even after Angular navigated elsewhere', async () => {
      (routerSpy as any).lastSuccessfulNavigation = () => ({ previousNavigation: { id: 2 } });
      component.window = { history: { length: 3, state: { navigationId: 3 }, back: jasmine.createSpy('back') } };
      await component.goBack();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'home'], { replaceUrl: true });
      expect(component.window.history.back).not.toHaveBeenCalled();
    });

    for (const returnUrl of ['/topic-mobile/11/22', '/assessment-mobile/assessment/11/8/11', '/experiences']) {
      it(`returns to ${returnUrl}`, async () => {
        component.window = { history: { state: { notificationsReturnUrl: returnUrl } } };
        await component.goBack();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(returnUrl, { replaceUrl: true });
      });
    }

    for (const returnUrl of ['https://example.com/', '//example.com/', '/v3/notifications?from=home', '/%invalid', '/auth/logout']) {
      it(`falls back to Home for an invalid return destination: ${returnUrl}`, async () => {
        component.window = { history: { state: { notificationsReturnUrl: returnUrl } } };
        await component.goBack();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['v3', 'home'], { replaceUrl: true });
        expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
      });
    }

    it('dismisses a modal even in a mobile layout', async () => {
      component.mode = 'modal';
      utilsSpy.isMobile = jasmine.createSpy('isMobile').and.returnValue(true);
      await component.goBack();
      expect(modalSpy.dismiss).toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('keyboardEvent', () => {
    it('should fail keyboardEvent', fakeAsync(() => {
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
      });

      keyboardEvent.preventDefault = spyOn(keyboardEvent, 'preventDefault');

      component.dismiss(keyboardEvent).then(resultDismiss => {
        expect(resultDismiss).toBeUndefined();
      });
      component.clickTodoItem({
        meta: {
          activity_id: 1,
          context_id: 2,
          assessment_id: 3,
          assessment_submission_id: 4,
        },
        type: 'any type',
      }).then(clickTodoItem => {
        expect(clickTodoItem).toBeUndefined();
      });
      const showEventDetail = component.showEventDetail({} as any, keyboardEvent);
      const goBack = component.goBack(keyboardEvent);
      flushMicrotasks();

      expect(showEventDetail).toBeUndefined();
      expect(goBack).toBeUndefined();
      expect(keyboardEvent.preventDefault).not.toHaveBeenCalled();
    }));


    it('should accept correct keyboardEvent', fakeAsync(() => {
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Space',
        code: 'Space',
      });

      keyboardEvent.preventDefault = spyOn(keyboardEvent, 'preventDefault');

      component.dismiss(keyboardEvent);
      component.clickTodoItem({
        meta: {
          activity_id: 1,
          context_id: 2,
          assessment_id: 3,
          assessment_submission_id: 4,
        },
        type: 'any type',
      });
      const showEventDetail = component.showEventDetail({} as any, keyboardEvent);
      component.goBack(keyboardEvent);
      flushMicrotasks();

      expect(showEventDetail).toBeUndefined();
      expect(keyboardEvent.preventDefault).toHaveBeenCalledTimes(3);
    }));
  });
});
