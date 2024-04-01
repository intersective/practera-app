import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { AuthDirectLoginComponent } from './auth-direct-login.component';
import { AuthService } from '@v3/services/auth.service';
import { of } from 'rxjs';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ExperienceService } from '@v3/services/experience.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { BrowserStorageServiceMock } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { SharedService } from '@v3/services/shared.service';


describe('AuthDirectLoginComponent', () => {
  let component: AuthDirectLoginComponent;
  let fixture: ComponentFixture<AuthDirectLoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: ActivatedRoute;
  let utils: UtilsService;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let switcherSpy: jasmine.SpyObj<ExperienceService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let sharedSpy: jasmine.SpyObj<SharedService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [AuthDirectLoginComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', ['onPageLoad', 'initWebServices']),
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', {
            'directLogin': of(true)
          })
        },
        {
          provide: ExperienceService,
          useValue: jasmine.createSpyObj('ExperienceService', {
            'getMyInfo': of(true),
            'switchProgram': of(true)
          })
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert'])
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                authToken: 'abc'
              })
            }
          }
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthDirectLoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routeSpy = TestBed.inject(ActivatedRoute);
    utils = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    switcherSpy = TestBed.inject(ExperienceService) as jasmine.SpyObj<ExperienceService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    sharedSpy = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
  });

  beforeEach(() => {
    authServiceSpy.authenticate.and.returnValue(of({} as any));
    switcherSpy.getMyInfo.and.returnValue(of({}));
    switcherSpy.switchProgram.and.returnValue(Promise.resolve(of({})));
    storageSpy.get.and.returnValue([{ timeline: { id: 1 } }]);
    storageSpy.getConfig.and.returnValue({ logo: null });
  });

  describe('when testing ngOnInit()', () => {
    it('should pop up alert if auth token is not provided', fakeAsync(() => {
      const params = { authToken: null };
      routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => params[key]);
      utils.isEmpty = jasmine.createSpy('isEmpty').and.returnValue(true);

      tick(50);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(notificationSpy.alert.calls.count()).toBe(1);
      });
    }));

    it('should pop up alert if direct login service throw error', fakeAsync(() => {
      const params = { authToken: 'abc' };
      routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => params[key]);
      authServiceSpy.authenticate.and.throwError('');
      fixture.detectChanges();
      tick(50);
      fixture.detectChanges();
      expect(notificationSpy.alert.calls.count()).toBe(1);

      const button = notificationSpy.alert.calls.first().args[0].buttons[0];
      (typeof button === 'string') ? button : button.handler(true);

      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['login']);
    }));

    describe('should navigate to', () => {
      let redirect;
      let switchProgram = true;
      const params = {
        authToken: 'abc',
        redirect: '',
        tl: 1,
        act: 2,
        ctxt: 3,
        asmt: 4,
        sm: 5,
        top: 6,
      };
      let tmpParams;
      let doAuthentication;
      let setReferrerCalled = false;
      let setReferrerCalledWith;
      beforeEach(() => {
        tmpParams = JSON.parse(JSON.stringify(params));
        doAuthentication = true;
        setReferrerCalled = false;
        setReferrerCalledWith = null;
      });

      afterEach(fakeAsync(() => {
        storageSpy.getUser.and.returnValue({
          timelineId: 2
        });
        utils.find = jasmine.createSpy('find').and.returnValue([]);
        utils.isEmpty = jasmine.createSpy('isEmpty').and.returnValue(false);
        routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => tmpParams[key]);
        fixture.detectChanges();
        tick(50);
        fixture.detectChanges();

        if (doAuthentication) {
          expect(authServiceSpy.authenticate.calls.count()).toBe(1);
          expect(switcherSpy.getMyInfo.calls.count()).toBe(1);
        } else {
          expect(authServiceSpy.authenticate.calls.count()).toBe(0);
          expect(switcherSpy.getMyInfo.calls.count()).toBe(0);
        }

        if (switchProgram) {
          expect(switcherSpy.switchProgram.calls.count()).toBe(1);
        }
        if (setReferrerCalled) {
          expect(storageSpy.setReferrer.calls.count()).toBe(1);
          expect(storageSpy.setReferrer).toHaveBeenCalledWith(setReferrerCalledWith);
        }

        expect(sharedSpy.initWebServices).toHaveBeenCalled();
        expect(routerSpy.navigate.calls.first().args[0]).toEqual(redirect);
      }));

      it('skip authentication if auth token match', () => {
        switchProgram = false;
        redirect = ['experiences'];
        storageSpy.get.and.returnValue('abc');
        doAuthentication = false;
      });

      it('program switcher page if timeline id is not passed in', () => {
        switchProgram = false;
        redirect = ['experiences'];
      });

      it('program switcher page if timeline id is not in programs', () => {
        params.redirect = 'home';
        params.tl = 999;
        switchProgram = false;
        redirect = ['experiences'];
      });
      it('home page', () => {
        tmpParams.redirect = 'home';
        redirect = ['v3', 'home'];
      });
      it('project page', () => {
        tmpParams.redirect = 'project';
        redirect = ['v3', 'home'];
      });
      it('home page if activity id miss', () => {
        tmpParams.redirect = 'activity';
        tmpParams.act = null;
        redirect = ['v3', 'home'];
      });
      it('activity page', () => {
        tmpParams.redirect = 'activity';
        redirect = ['v3', 'activity-desktop', tmpParams.act];
      });
      it('activity-task page', () => {
        tmpParams.redirect = 'activity_task';
        redirect = ['v3', 'activity-desktop', tmpParams.act];
        // redirect = ['activity-task', tmpParams.act];
      });

      it('activity-task page with referrer url', () => {
        tmpParams.redirect = 'activity_task';
        tmpParams.activity_task_referrer_url = 'https://referrer.practera.com';
        redirect = ['v3', 'activity-desktop', tmpParams.act];
        setReferrerCalled = true;
        setReferrerCalledWith = { route: 'activity-task', url: tmpParams.activity_task_referrer_url };
      });

      it('home page if activity id miss', () => {
        tmpParams.redirect = 'activity_task';
        tmpParams.act = null;
        redirect = ['v3', 'home'];
      });
      it('home page if activity id miss', () => {
        tmpParams.redirect = 'assessment';
        tmpParams.act = null;
        redirect = ['v3', 'home'];
      });
      it('home page if context id miss', () => {
        tmpParams.redirect = 'assessment';
        tmpParams.ctxt = null;
        redirect = ['v3', 'home'];
      });
      it('home page if assessment id miss', () => {
        tmpParams.redirect = 'assessment';
        tmpParams.asmt = null;
        redirect = ['v3', 'home'];
      });
      it('assessment page', () => {
        utils.isMobile = jasmine.createSpy('isMobile').and.returnValues(false);
        storageSpy.singlePageAccess = false;

        tmpParams.redirect = 'assessment';
        redirect = [
          'v3',
          'activity-desktop',
          tmpParams.act,
          {
            task: 'assessment',
            task_id: tmpParams.asmt,
            context_id: tmpParams.ctxt
          }
        ];
        // redirect = ['assessment', 'assessment', tmpParams.act, tmpParams.ctxt, tmpParams.asmt];
      });

      it('assessment page (mobile)', () => {
        utils.isMobile = jasmine.createSpy('isMobile').and.returnValues(true);

        tmpParams.redirect = 'assessment';
        tmpParams.sm = undefined;
        redirect = [
          'assessment-mobile',
          'assessment',
          tmpParams.act,
          tmpParams.ctxt,
          tmpParams.asmt,
        ];
      });

      it('assessment page with submission id (mobile)', () => {
        utils.isMobile = jasmine.createSpy('isMobile').and.returnValues(true);

        tmpParams.redirect = 'assessment';
        redirect = [
          'assessment-mobile',
          'assessment',
          tmpParams.act,
          tmpParams.ctxt,
          tmpParams.asmt,
          tmpParams.sm
        ];
      });

      xit('assessment page (onePageOnly restriction)', () => {
        utils.isMobile = jasmine.createSpy('isMobile').and.returnValues(false);
        storageSpy.singlePageAccess = true; // singlePageRestriction

        tmpParams.redirect = 'assessment';
        tmpParams.sm = undefined;
        redirect = [
          'assessment',
          'assessment',
          tmpParams.act,
          tmpParams.ctxt,
          tmpParams.asmt,
        ];
      });

      it('assessment page with referrer', () => {
        utils.isMobile = jasmine.createSpy('isMobile').and.returnValues(false);
        storageSpy.singlePageAccess = false;
        tmpParams.assessment_referrer_url = 'https://referrer.practera.com';
        tmpParams.redirect = 'assessment';
        redirect = [
          'v3',
          'activity-desktop',
          tmpParams.act,
          {
            task: 'assessment',
            task_id: tmpParams.asmt,
            context_id: tmpParams.ctxt
          }
        ];
        setReferrerCalled = true;

        setReferrerCalledWith = { route: 'assessment', url: tmpParams.assessment_referrer_url };
      });

      it('topic page', () => {
        utils.isMobile = jasmine.createSpy('isMobile').and.callFake(() => {
          return false;
        });
        storageSpy.singlePageAccess = false; // singlePageRestriction

        tmpParams.redirect = 'topic';
        redirect = [
          'v3',
          'activity-desktop',
          tmpParams.act,
          {
            task: 'topic',
            task_id: tmpParams.top
          }
        ];
      });

      it('topic page (mobile)', () => {
        utils.isMobile = jasmine.createSpy('isMobile').and.callFake(() => {
          return true;
        });

        tmpParams.redirect = 'topic';
        redirect = [
          'topic-mobile',
          tmpParams.act,
          tmpParams.top
        ];
      });

      xit('topic page (onePageOnly restriction)', () => {
        utils.isMobile = jasmine.createSpy().and.returnValue(false);
        storageSpy.get.and.returnValue(true); // singlePageRestriction

        tmpParams.redirect = 'topic';
        redirect = [
          'topic',
          tmpParams.act,
          tmpParams.top
        ];
      });

      it('home page if topic id miss', () => {
        tmpParams.redirect = 'topic';
        tmpParams.top = null;
        redirect = ['v3', 'home'];
      });
      it('reviews page', () => {
        tmpParams.redirect = 'reviews';
        redirect = ['v3', 'reviews'];
      });
      it('home page if context id miss', () => {
        tmpParams.redirect = 'review';
        tmpParams.ctxt = null;
        redirect = ['v3', 'home'];
      });
      it('home page if assessment id miss', () => {
        tmpParams.redirect = 'review';
        tmpParams.asmt = null;
        redirect = ['v3', 'home'];
      });
      it('home page if submission id miss', () => {
        tmpParams.redirect = 'review';
        tmpParams.sm = null;
        redirect = ['v3', 'home'];
      });
      it('review page', () => {
        utils.isMobile = jasmine.createSpy('isMobile').and.returnValues(false);
        tmpParams.redirect = 'review';
        redirect = [
          'v3',
          'review-desktop',
          tmpParams.sm
        ];
      });

      it('review page (mobile)', () => {
        utils.isMobile = jasmine.createSpy('isMobile').and.returnValues(true);
        tmpParams.redirect = 'review';
        redirect = [
          'assessment-mobile',
          'review',
          tmpParams.ctxt,
          tmpParams.asmt,
          tmpParams.sm,
          { from: 'reviews' }
        ];
      });

      it('review page with referrer', () => {
        tmpParams.redirect = 'review';
        tmpParams.assessment_referrer_url = 'https://referrer.practera.com';
        redirect = [
          'v3',
          'review-desktop',
          tmpParams.sm
        ];
        setReferrerCalled = true;

        setReferrerCalledWith = { route: 'assessment', url: tmpParams.assessment_referrer_url };
      });

      it('chat page', () => {
        tmpParams.redirect = 'chat';
        redirect = ['v3', 'messages'];
      });
      it('settings page', () => {
        tmpParams.redirect = 'settings';
        redirect = ['v3', 'settings'];
      });
      it('home page', () => {
        tmpParams.redirect = 'default';
        redirect = ['v3', 'home'];
      });

    });
  });

  describe('singlePageRestriction()', () => {
    it('should cache "onePageOnly" as singlePageRestriction on localStorage', () => {
      routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.returnValue('true');
      const result = component.singlePageRestriction();
      expect(storageSpy.singlePageAccess).toEqual(true);
      expect(result).toEqual(true);
    });

    it('should not cache anything if no "onePageOnly" param provided in url', () => {
      routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.returnValue('anything else');
      const result = component.singlePageRestriction();
      expect(storageSpy.singlePageAccess).toEqual(false);
      expect(result).toBeFalsy();
    });
  });
});

