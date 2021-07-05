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
import { PusherService } from '@shared/pusher/pusher.service';
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
          useClass: TestUtils
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', ['onPageLoad']),
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
          provide: PusherService,
          useValue: jasmine.createSpyObj('PusherService', {
            'initialise': Promise.resolve(true)
          })
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
  }));

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should initialize the app', () => {
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
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
        api: 'http://127.0.0.1:8080/',
        appkey: 'b11e7c189b',
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
        defaultCountryModel: 'AUS'
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
