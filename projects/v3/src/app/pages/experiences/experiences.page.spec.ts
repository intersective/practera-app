import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule, LoadingController } from '@ionic/angular/lazy';
import { ExperienceService } from '@v3/app/services/experience.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ExperiencesPage } from './experiences.page';
import { MockRouter } from '@testingv3/mocked.service';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { TestUtils } from '@testingv3/utils';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { environment } from '@v3/environments/environment';

describe('ExperiencesPage', () => {
  let component: ExperiencesPage;
  let fixture: ComponentFixture<ExperiencesPage>;
  let storageSpy: BrowserStorageService;
  let experienceServiceSpy: jasmine.SpyObj<ExperienceService>;
  let loadingCtrlSpy: LoadingController;
  let notificationsSpy: jasmine.SpyObj<NotificationsService>;
  let experiences$: BehaviorSubject<any[] | null>;

  beforeEach(waitForAsync(() => {
    experiences$ = new BehaviorSubject<any[] | null>(null);
    TestBed.configureTestingModule({
      declarations: [ ExperiencesPage ],
      imports: [IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({}),
        },
        {
          provide: ExperienceService,
          useValue: jasmine.createSpyObj('ExperienceService', {
            'getPrograms': undefined,
            'getExperiences': undefined,
            'switchProgramAndNavigate': Promise.resolve(true),
            'getProgresses': of([]),
          }, {
            'programsWithProgress$': of([]),
            'experiences$': experiences$,
          }),
        },
        {
          provide: LoadingController,
          useValue: jasmine.createSpyObj('LoadingController', ['create']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', {
            'alert': Promise.resolve(true),
            'refreshNotifications': of([]),
          }),
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getConfig': {},
            'getUser': null,
            'get': null,
          }),
        },
        {
          provide: UnlockIndicatorService,
          useValue: jasmine.createSpyObj('UnlockIndicatorService', ['clearAllTasks'], {
            'unlockedTasks$': of([])
          })
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExperiencesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    experienceServiceSpy = TestBed.inject(ExperienceService) as jasmine.SpyObj<ExperienceService>;
    loadingCtrlSpy = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
    notificationsSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('instituteLogo()', () => {
    it('should get instituteLogo value from localStorage', () => {
      storageSpy.getConfig = jasmine.createSpy('getConfig').and.returnValue({
        logo: 'abcdefg'
      });
      expect(component.instituteLogo).toEqual('abcdefg');
    });
  });

  describe('layout helpers', () => {
    it('should mark compact layout only for one or two experiences', () => {
      expect(component.isCompactLayout(1)).toBeTrue();
      expect(component.isCompactLayout(2)).toBeTrue();
      expect(component.isCompactLayout(3)).toBeFalse();
    });
  });

  describe('when experiences load', () => {
    const onlyExperience = { projectId: 7, name: 'Only', uuid: 'only' };

    it('enters the only experience and replaces this page with home', () => {
      spyOn(component, 'switchProgram').and.returnValue(Promise.resolve(true));

      experiences$.next([onlyExperience]);

      expect(component.redirectingToHome).toBeTrue();
      expect(component.switchProgram).toHaveBeenCalledWith(
        onlyExperience,
        undefined,
        { replaceUrl: true },
      );
      expect(experienceServiceSpy.getProgresses).not.toHaveBeenCalled();
    });

    it('opens home in place of the experiences page', fakeAsync(() => {
      const presentLoading = jasmine.createSpy('present').and.returnValue(Promise.resolve());
      const dismissLoading = jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true));
      loadingCtrlSpy.create = jasmine.createSpy('create').and.returnValue(Promise.resolve({
        present: presentLoading,
        dismiss: dismissLoading,
      }));
      experienceServiceSpy.switchProgramAndNavigate.and.returnValue(Promise.resolve(['v3', 'home']));
      notificationsSpy.refreshNotifications.and.returnValue(of([]));
      (component['router'].navigate as jasmine.Spy).and.returnValue(Promise.resolve(true));

      experiences$.next([onlyExperience]);
      flushMicrotasks();

      expect(experienceServiceSpy.switchProgramAndNavigate).toHaveBeenCalledWith(onlyExperience);
      expect(component['router'].navigate).toHaveBeenCalledWith(['v3', 'home'], { replaceUrl: true });
      expect(component.redirectingToHome).toBeTrue();
    }));

    it('stays on the experiences page when the only experience cannot be opened', fakeAsync(() => {
      const presentLoading = jasmine.createSpy('present').and.returnValue(Promise.resolve());
      const dismissLoading = jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true));
      loadingCtrlSpy.create = jasmine.createSpy('create').and.returnValue(Promise.resolve({
        present: presentLoading,
        dismiss: dismissLoading,
      }));
      experienceServiceSpy.switchProgramAndNavigate.and.throwError('SAMPLE_ERROR');

      experiences$.next([onlyExperience]);
      flushMicrotasks();

      expect(notificationsSpy.alert).toHaveBeenCalled();
      expect(component['router'].navigate).not.toHaveBeenCalled();
      expect(component.redirectingToHome).toBeFalse();
      expect(experienceServiceSpy.getProgresses).toHaveBeenCalledWith([7]);
    }));

    it('does not enter the same experience twice', () => {
      spyOn(component, 'switchProgram').and.returnValue(Promise.resolve(true));

      experiences$.next([onlyExperience]);
      experiences$.next([onlyExperience]);

      expect(component.switchProgram).toHaveBeenCalledTimes(1);
    });

    it('keeps the picker when there is more than one experience', () => {
      experiences$.next([
        { projectId: 1, name: 'First' },
        { projectId: 2, name: 'Second' },
      ]);

      expect(component.redirectingToHome).toBeFalse();
      expect(experienceServiceSpy.getProgresses).toHaveBeenCalledWith([1, 2]);
    });

    it('keeps a single experience on screen in demo mode', () => {
      const demo = environment.demo;
      environment.demo = true;

      try {
        experiences$.next([onlyExperience]);

        expect(component.redirectingToHome).toBeFalse();
        expect(experienceServiceSpy.getProgresses).toHaveBeenCalledWith([7]);
      } finally {
        environment.demo = demo;
      }
    });
  });

  describe('switchProgram()', () => {
    let presentLoading: any;
    let dismissLoading: any;

    beforeEach(() => {
      experienceServiceSpy.switchProgramAndNavigate.and.returnValue(Promise.resolve(['v3', 'home']));
      notificationsSpy.refreshNotifications.and.returnValue(of([]));

      presentLoading = jasmine.createSpy('present');
      dismissLoading = jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true));
      loadingCtrlSpy.create = jasmine.createSpy('create').and.returnValue(Promise.resolve({
        present: presentLoading,
        dismiss: dismissLoading,
      }));
    });

    it('should redirect user', fakeAsync(() => {
      const operationOrder: string[] = [];
      experienceServiceSpy.switchProgramAndNavigate.and.callFake(async () => {
        operationOrder.push('switch');
        return ['v3', 'home'];
      });
      notificationsSpy.refreshNotifications.and.callFake(() => {
        operationOrder.push('refresh');
        return of([]);
      });
      dismissLoading.and.callFake(() => {
        operationOrder.push('dismiss');
        return Promise.resolve(true);
      });

      component.switchProgram({
        testing: true
      } as any);

      flushMicrotasks();
      expect(experienceServiceSpy.switchProgramAndNavigate).toHaveBeenCalledWith({
        testing: true
      });
      expect(notificationsSpy.refreshNotifications).toHaveBeenCalled();
      expect(operationOrder).toEqual(['switch', 'refresh', 'dismiss']);
    }));

    it('should redirect user with keyboard event', fakeAsync(() => {
      component.switchProgram({
        testing: true
      } as any, new KeyboardEvent('keydown', {
        code: 'Enter',
        key: 'Enter',
      }));

      flushMicrotasks();
      expect(experienceServiceSpy.switchProgramAndNavigate).toHaveBeenCalledWith({
        testing: true
      });
    }));

    it('should not redirect user with wrong keyboard event', fakeAsync(() => {

      component.switchProgram({
        testing: true
      } as any, new KeyboardEvent('keydown', {
        code: 'Tab',
        key: 'Tab',
      }));

      flushMicrotasks();
      expect(experienceServiceSpy.switchProgramAndNavigate).not.toHaveBeenCalledWith({
        testing: true
      });
    }));

    it('should throw error with alertCtrl', fakeAsync(() => {
      experienceServiceSpy.switchProgramAndNavigate.and.throwError('SAMPLE_ERROR');

      component.switchProgram({
        testing: true
      } as any);

      flushMicrotasks();
      expect(notificationsSpy.alert).toHaveBeenCalled();
      expect(notificationsSpy.refreshNotifications).not.toHaveBeenCalled();
    }));

    it('should navigate with empty state when notification refresh fails', fakeAsync(() => {
      const consoleErrorSpy = spyOn(console, 'error');
      notificationsSpy.refreshNotifications.and.returnValue(
        throwError(() => new Error('Unable to refresh notifications'))
      );

      component.switchProgram({ testing: true } as any);

      flushMicrotasks();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(dismissLoading).toHaveBeenCalled();
      expect(component['router'].navigate).toHaveBeenCalledWith(['v3', 'home'], { replaceUrl: false });
      expect(notificationsSpy.alert).not.toHaveBeenCalled();
    }));
  });
});
