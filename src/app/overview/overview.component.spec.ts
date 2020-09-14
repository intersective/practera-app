import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, flushMicrotasks, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OverviewComponent } from './overview.component';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { UtilsService } from '@services/utils.service';
import { TestUtils } from '@testing/utils';
import { MockRouter, MockActivatedRouter } from '@testing/mocked.service';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { Observable, of, pipe } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';
import { PushNotificationService } from '@services/push-notification.service';
import { NotificationService } from '@shared/notification/notification.service';
import { SharedModule } from '@shared/shared.module';
import { OverviewRoutingModule } from './overview-routing.module';
import { FastFeedbackModule } from '../fast-feedback/fast-feedback.module';

class Page {
  get navbarTitle() {
    return this.query<HTMLElement>('ion-title.ion-text-center');
  }
  fixture: ComponentFixture<OverviewComponent>;

  constructor(fixture: ComponentFixture<OverviewComponent>) {
    this.fixture = fixture;
  }

  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }
}

describe('OverviewComponent', () => {
  const PROGRAM_NAME = 'Dummy Program name';

  let page: Page;
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let routerSpy: Router;
  let activatedRouteSpy: ActivatedRoute;
  let utils: UtilsService;
  let pushNotificationSpy: PushNotificationService;
  let notificationSpy: NotificationService;
  let fastfeedbackSpy: jasmine.SpyObj<FastFeedbackService>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        OverviewRoutingModule,
        FastFeedbackModule,
      ],
      declarations: [ OverviewComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: {
              programName: PROGRAM_NAME,
            }
          })
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['isMobile']),
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: ActivatedRoute,
          useValue: {
            data: {
              // force run function passed in
              subscribe: (a) => a()
            },
            snapshot: {
              paramMap: convertToParamMap({ activityId: 1 }),
            }
          }
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', ['pullFastFeedback'])
        },
        {
          provide: PushNotificationService,
          useValue: jasmine.createSpyObj('PushNotificationService', {
            'initiatePushNotification': Promise.resolve(true),
            'promptForPermission': Promise.resolve(true),
          })
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', {
            'pushNotificationPermissionPopUp': Promise.resolve(true)
          })
        },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    page = new Page(fixture);

    component = fixture.componentInstance;
    activatedRouteSpy = TestBed.inject(ActivatedRoute);
    utils = TestBed.inject(UtilsService);
    pushNotificationSpy = TestBed.inject(PushNotificationService);
    notificationSpy = TestBed.inject(NotificationService);
    fastfeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
    fastfeedbackSpy.pullFastFeedback.and.returnValue(of(true));
    component.initiator$ = of({});
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('on native app', () => {
    it('should try to show popup if permission not granted', fakeAsync(() => {
      // recreate component to test constructor
      TestBed.createComponent(OverviewComponent);
      flushMicrotasks();
      expect(notificationSpy.pushNotificationPermissionPopUp).toHaveBeenCalled();
    }));

    it('should not popup if permission has been granted', fakeAsync(() => {
      pushNotificationSpy.promptForPermission = jasmine.createSpy('promptForPermission').and.returnValue(Promise.resolve(false));
      // recreate component to test constructor
      TestBed.createComponent(OverviewComponent);
      flushMicrotasks();
      expect(notificationSpy.pushNotificationPermissionPopUp).not.toHaveBeenCalled();
    }));
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });
    it('should get program name and pull fastfeedback', () => {
      expect(component.programName).toEqual(PROGRAM_NAME);
      expect(fastfeedbackSpy.pullFastFeedback).toHaveBeenCalled();
    });

    it('should try to initiate Push Notification', () => {
      expect(pushNotificationSpy.initiatePushNotification).toHaveBeenCalled();
      expect(pushNotificationSpy.promptForPermission).toHaveBeenCalled();
    });
  });

  describe('view', () => {
    it('should shows program name at the navbar', () => {
      fixture.detectChanges();
      expect(page.navbarTitle.textContent).toEqual(PROGRAM_NAME);
    });
  });
});
