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

  it('should initialize the app', async () => {
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    expect(sharedServiceSpy.initWebServices).toHaveBeenCalled();
  });

  // TODO: add more tests!

});
