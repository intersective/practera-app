import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';

import { NotificationsPage } from './notifications.page';
import { of } from 'rxjs';
import { MockRouter } from '@testingv3/mocked.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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
      imports: [IonicModule.forRoot()],
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
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['dismiss']),
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPage);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    utilsSpy = TestBed.inject(UtilsService);
    modalSpy = TestBed.inject(ModalController);
    notificationSpy = TestBed.inject(NotificationsService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should initiate subscriptions', () => {
      utilsSpy.isEmpty = jasmine.createSpy('isEmpty').and.returnValue(false);
      component['_addChatTodoItem'] = jasmine.createSpy('_addChatTodoItem');
      component.ngOnInit();

      expect(component.todoItems).toEqual(true as any);
      expect(component.eventReminders).toContain(true);
      expect(component['_addChatTodoItem']).toHaveBeenCalledWith(true);
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
      utilsSpy.isMobile = jasmine.createSpy('isMobile').and.returnValue(false);
      component.goBack();

      expect(modalSpy.dismiss).toHaveBeenCalled();
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
      expect(keyboardEvent.preventDefault).toHaveBeenCalledTimes(4);
    }));
  });
});
