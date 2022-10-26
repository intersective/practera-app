import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';

import { NotificationsPage } from './notifications.page';
import { of } from 'rxjs';
import { MockRouter } from '@testingv3/mocked.service';

describe('NotificationsPage', () => {
  let component: NotificationsPage;
  let fixture: ComponentFixture<NotificationsPage>;
  let routerSpy: Router;
  let utilsSpy: UtilsService;
  let modalSpy: ModalController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsPage ],
      imports: [IonicModule.forRoot()],
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
            'notification$': of(),
            'eventReminder$': of(),
            'newMessage$': of(),
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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('timeFormatter()', () => {
    it('should format time with UtilsService', () => {
      component.timeFormatter('abcdefg');
      expect(utilsSpy.timeFormatter).toHaveBeenCalledWith('abcdefg');
    });
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
});
