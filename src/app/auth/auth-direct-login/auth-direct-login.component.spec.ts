import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthDirectLoginComponent } from './auth-direct-login.component';
import { AuthService } from '../auth.service';
import { Observable, of, pipe } from 'rxjs';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { SwitcherService } from '../../switcher/switcher.service';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { BrowserStorageServiceMock } from '@testing/mocked.service';
import { Apollo } from 'apollo-angular';

describe('AuthDirectLoginComponent', () => {
  let component: AuthDirectLoginComponent;
  let fixture: ComponentFixture<AuthDirectLoginComponent>;
  let serviceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: ActivatedRoute;
  let utils: UtilsService;
  let apolloSpy: jasmine.SpyObj<Apollo>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let switcherSpy: jasmine.SpyObj<SwitcherService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ AuthDirectLoginComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: Apollo,
          useValue: jasmine.createSpyObj('Apollo', ['getClient'])
        },
        UtilsService,
        NewRelicService,
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock
          // useValue: jasmine.createSpyObj('BrowserStorageService', ['get', 'getConfig', 'getUser'])
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['directLogin'])
        },
        {
          provide: SwitcherService,
          useValue: jasmine.createSpyObj('SwitcherService', ['getMyInfo', 'switchProgram'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['alert'])
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
    serviceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routeSpy = TestBed.inject(ActivatedRoute);
    utils = TestBed.inject(UtilsService);
    apolloSpy = TestBed.inject(Apollo) as jasmine.SpyObj<Apollo>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    switcherSpy = TestBed.inject(SwitcherService) as jasmine.SpyObj<SwitcherService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  beforeEach(() => {
    serviceSpy.directLogin.and.returnValue(of({}));
    switcherSpy.getMyInfo.and.returnValue(of({}));
    switcherSpy.switchProgram.and.returnValue(of({}));
    storageSpy.get.and.returnValue([{timeline: {id: 1}}]);
    storageSpy.getConfig.and.returnValue({logo: null});
    apolloSpy.getClient.and.returnValue({clearStore: () => true});
  });

  describe('when testing ngOnInit()', () => {
    it('should pop up alert if auth token is not provided', fakeAsync(() => {
      const params = { authToken: null };
      routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => params[key]);
      tick();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(notificationSpy.alert.calls.count()).toBe(1);
      });
    }));

    it('should pop up alert if direct login service throw error', fakeAsync(() => {
      const params = { authToken: 'abc' };
      routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => params[key]);
      serviceSpy.directLogin.and.throwError('');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(notificationSpy.alert.calls.count()).toBe(1);
      notificationSpy.alert.calls.first().args[0].buttons[0].handler();
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
        sm: 5
      };
      let tmpParams;
      beforeEach(() => {
        tmpParams = JSON.parse(JSON.stringify(params));
      });
      afterEach(fakeAsync(() => {
        routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => tmpParams[key]);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        expect(serviceSpy.directLogin.calls.count()).toBe(1);
        expect(switcherSpy.getMyInfo.calls.count()).toBe(1);
        if (switchProgram) {
          expect(switcherSpy.switchProgram.calls.count()).toBe(1);
        }
        expect(routerSpy.navigate.calls.first().args[0]).toEqual(redirect);
      }));
      it('program switcher page if timeline id is not passed in', () => {
        switchProgram = false;
        redirect = ['switcher', 'switcher-program'];
      });
      it('program switcher page if timeline id is not in programs', () => {
        tmpParams.redirect = 'home';
        storageSpy.get.and.returnValue([
          {timeline: {id: 2}}
        ]);
        switchProgram = false;
        redirect = ['switcher', 'switcher-program'];
      });
      it('home page', () => {
        tmpParams.redirect = 'home';
        redirect = ['app', 'home'];
      });
      it('project page', () => {
        tmpParams.redirect = 'project';
        redirect = ['app', 'home'];
      });
      it('home page if activity id miss', () => {
        tmpParams.redirect = 'activity';
        tmpParams.act = null;
        redirect = ['app', 'home'];
      });
      it('activity page', () => {
        tmpParams.redirect = 'activity';
        redirect = ['app', 'activity', tmpParams.act];
      });
      it('home page if activity id miss', () => {
        tmpParams.redirect = 'assessment';
        tmpParams.act = null;
        redirect = ['app', 'home'];
      });
      it('home page if context id miss', () => {
        tmpParams.redirect = 'assessment';
        tmpParams.ctxt = null;
        redirect = ['app', 'home'];
      });
      it('home page if assessment id miss', () => {
        tmpParams.redirect = 'assessment';
        tmpParams.asmt = null;
        redirect = ['app', 'home'];
      });
      it('assessment page', () => {
        tmpParams.redirect = 'assessment';
        redirect = [
          'app',
          'activity',
          tmpParams.act,
          {
            task: 'assessment',
            task_id: tmpParams.asmt,
            context_id: tmpParams.ctxt
          }
        ];
        // redirect = ['assessment', 'assessment', tmpParams.act, tmpParams.ctxt, tmpParams.asmt];
      });
      it('reviews page', () => {
        tmpParams.redirect = 'reviews';
        redirect = ['app', 'reviews'];
      });
      it('home page if context id miss', () => {
        tmpParams.redirect = 'review';
        tmpParams.ctxt = null;
        redirect = ['app', 'home'];
      });
      it('home page if assessment id miss', () => {
        tmpParams.redirect = 'review';
        tmpParams.asmt = null;
        redirect = ['app', 'home'];
      });
      it('home page if submission id miss', () => {
        tmpParams.redirect = 'review';
        tmpParams.sm = null;
        redirect = ['app', 'home'];
      });
      it('review page', () => {
        tmpParams.redirect = 'review';
        redirect = ['assessment', 'review', tmpParams.ctxt, tmpParams.asmt, tmpParams.sm];
      });
      it('chat page', () => {
        tmpParams.redirect = 'chat';
        redirect = ['app', 'chat'];
      });
      it('settings page', () => {
        tmpParams.redirect = 'settings';
        redirect = ['app', 'settings'];
      });
      it('home page', () => {
        tmpParams.redirect = 'default';
        redirect = ['app', 'home'];
      });
    });
  });
});

