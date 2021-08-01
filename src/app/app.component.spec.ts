import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MockRouter } from '@testing/mocked.service';
import { UtilsService } from '@services/utils.service';
import { TestUtils } from '@testing/utils';
import { SharedService } from '@services/shared.service';
import { AuthService } from './auth/auth.service';
import { BrowserStorageService } from '@services/storage.service';
import { VersionCheckService } from '@services/version-check.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';
import { of } from 'rxjs';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let app: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let storage: BrowserStorageService;
  let sharedServiceSpy: SharedService;
  let utilsSpy: UtilsService;
  let routerSpy: Router;
  let /* statusBarSpy, splashScreenSpy, platformReadySpy, */ platformSpy;

  beforeEach(async(() => {
    // statusBarSpy = jasmine.createSpyObj('StatusBar', ['styleDefault']);
    // splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
    // platformReadySpy = Promise.resolve();
    // platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['getQueryParams', 'urlQueryToObject', 'isEmpty', 'changeThemeColor', 'has']),
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', ['onPageLoad', 'initWebServices']),
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', {
            'getConfig': of({}),
            'isAuthenticated': of({}),
            'getStackConfig': of(true),
          })
        },
        {
          provide: Platform,
          useValue: jasmine.createSpyObj('Platform', {
            'ready': new Promise((resolve) => resolve(true))
          }),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', [
            'get',
            'set',
            'setConfig',
            'getUser',
            'stackConfig',
          ])
        },
        {
          provide: VersionCheckService,
          useValue: jasmine.createSpyObj('VersionCheckService', ['initiateVersionCheck'])
        },
        {
          provide: NewRelicService,
          useValue: jasmine.createSpyObj('NewRelicService', ['noticeError']),
        },
        DomSanitizer,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
    platformSpy = TestBed.inject(Platform);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    storage = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    sharedServiceSpy = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  }));

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should initialize the app', () => {
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    expect(sharedServiceSpy.initWebServices).toHaveBeenCalled();
  });

  describe('checkCustom()', () => {
    it(`should return true if have custom header`, () => {
      app.customHeader = 'test';
      authServiceSpy.isAuthenticated = jasmine.createSpy('authServiceSpy.isAuthenticated').and.returnValue(true);
      const result = app.checkCustom('header');
      expect(result).toEqual(true);
    });
    it(`should return false if any condition false (no custom header)`, () => {
      app.customHeader = null;
      authServiceSpy.isAuthenticated = jasmine.createSpy('authServiceSpy.isAuthenticated').and.returnValue(true);
      const result = app.checkCustom('header');
      expect(result).toEqual(false);
    });
    it(`should return false if any condition false (not authenticated)`, () => {
      app.customHeader = 'test';
      authServiceSpy.isAuthenticated = jasmine.createSpy('authServiceSpy.isAuthenticated').and.returnValue(false);
      const result = app.checkCustom('header');
      expect(result).toEqual(false);
    });
    it(`should return false if any condition false (wrong param)`, () => {
      app.customHeader = 'test';
      authServiceSpy.isAuthenticated = jasmine.createSpy('authServiceSpy.isAuthenticated').and.returnValue(true);
      const result = app.checkCustom('qwe');
      expect(result).toEqual(false);
    });
  });

  describe('analyseQueryParams()', () => {
    it(`should rnaviagte to global login if have apikey as query param`, () => {
      utilsSpy.getQueryParams = jasmine.createSpy('utilsSpy.getQueryParams').and.returnValue(new URLSearchParams('apikey=12345'));
      utilsSpy.urlQueryToObject = jasmine.createSpy('utilsSpy.urlQueryToObject').and.returnValue({});
      app.analyseQueryParams();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['global_login', '12345', {}]);
    });
    it(`should rnaviagte to secure if url have 'secure' and have auth_token as query param`, () => {
      utilsSpy.getQueryParams = jasmine.createSpy('utilsSpy.getQueryParams').and.returnValue(new URLSearchParams('do=secure&auth_token=12345'));
      utilsSpy.urlQueryToObject = jasmine.createSpy('utilsSpy.urlQueryToObject').and.returnValue({});
      app.analyseQueryParams();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['secure', '12345', {}]);
    });
    it(`should rnaviagte to reset password if url have 'resetpassword' and have apikey as query param`, () => {
      utilsSpy.getQueryParams = jasmine.createSpy('utilsSpy.getQueryParams').and.returnValue(new URLSearchParams('do=resetpassword&apikey=12345'));
      utilsSpy.urlQueryToObject = jasmine.createSpy('utilsSpy.urlQueryToObject').and.returnValue({});
      app.analyseQueryParams();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['reset_password', '12345']);
    });
    it(`should rnaviagte to registration if url have 'resetpassword' and have key and email as query param`, () => {
      utilsSpy.getQueryParams = jasmine.createSpy('utilsSpy.getQueryParams').and.returnValue(new URLSearchParams('do=registration&email=abc@.com&key=12345'));
      utilsSpy.urlQueryToObject = jasmine.createSpy('utilsSpy.urlQueryToObject').and.returnValue({});
      app.analyseQueryParams();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['registration', 'abc@.com', '12345']);
    });
  });

  describe('getCustomConfigurations()', () => {
    it(`should not do any thing if query params didn't have stack_uuid or storage didn't have stacl info`, () => {
      utilsSpy.getQueryParams = jasmine.createSpy('utilsSpy.getQueryParams').and.returnValue(new URLSearchParams(''));
      storage.stackConfig = null;
      app.getCustomConfigurations();
      expect(authServiceSpy.getConfig).not.toHaveBeenCalled();
    });
    it(`should auth service to get config`, () => {
      utilsSpy.getQueryParams = jasmine.createSpy('utilsSpy.getQueryParams').and.returnValue(new URLSearchParams(''));
      authServiceSpy.getConfig = jasmine.createSpy('authServiceSpy.getConfig').and.returnValue(
        of(
          {
            data: [
              {
                logo: 'https://media.intersective.com/img/learners_reviewers.png',
                theme_color: '#ffffee'
              }
            ]
          }
        )
      );
      storage.stackConfig = {
        uuid: '002',
        name: 'Practera App - Local Development',
        description: 'Participate in an experience as a learner or reviewer - Local',
        image: 'https://media.intersective.com/img/learners_reviewers.png',
        url: 'http://127.0.0.1:4200/',
        type: 'app',
        coreApi: 'http://127.0.0.1:8080',
        coreGraphQLApi: 'http://127.0.0.1:8000',
        chatApi: 'http://localhost:3000/local/graphql',
        filestack: {
          s3Config: {
            container: 'practera-aus',
            region: 'ap-southeast-2'
          },
        },
        defaultCountryModel: 'AUS',
        lastLogin: 1619660600368
      };
      app.getCustomConfigurations();
      expect(authServiceSpy.getConfig).toHaveBeenCalled();
    });
  });

  xdescribe('removed retrieveStackConfig()', () => {
    it('should make use of AuthService.getStackConfig to get stack info', () => {
      const SAMPLE_UUID = '4455ee45-5aac-44d3-94ed-b0e1cd0a45d4';
      const RESULT = {
        uuid: SAMPLE_UUID,
        name: 'Practera App (Local APPV2)',
        description: 'Participate in an experience or coach as a mentor - Local',
        image: 'https://media.intersective.com/img/global-login-practera-black-logo.png',
        url: 'http://127.0.0.1:4200/',
        type: 'app',
        coreApi: 'http://127.0.0.1:8080',
        coreGraphQLApi: 'http://127.0.0.1:8000',
        chatApi: 'http://localhost:3000/local/graphql',
        filestack: {
          s3Config: {
            container: 'practera-aus',
            region: 'ap-southeast-2',
            paths: {
              any: '/appv2/sandbox/uploads',
              image: '/appv2/sandbox/uploads',
              video: '/appv2/sandbox/video/uploads'
            }
          },
        },
        defaultCountryModel: 'AUS',
        lastLogin: 1619660600368
      };
      authServiceSpy.getStackConfig.and.returnValue(of(RESULT));
    });

    it('should not fun AuthService.getStackConfig when STACK_UUID not provided', () => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(authServiceSpy.getStackConfig).not.toHaveBeenCalled();
      });
    });
  });
});
