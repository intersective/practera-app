import { NgZone } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Platform } from '@ionic/angular';
import { TestUtils } from '@testingv3/utils';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from '@v3/services/auth.service';
import { SharedService } from '@v3/services/shared.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { VersionCheckService } from '@v3/services/version-check.service';
import { MockRouter } from '@testingv3/mocked.service';
import { environment } from '@v3/environments/environment';

describe('AppComponent', () => {
  let sharedServiceSpy: SharedService;
  let versionCheckServiceSpy: VersionCheckService;
  let utilsSpy: UtilsService;
  let storageSpy: BrowserStorageService;
  let authSpy: AuthService;
  let routerSpy: Router;
  let /* statusBarSpy, splashScreenSpy, platformReadySpy, */ platformSpy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        {
          provide: Platform,
          useValue: jasmine.createSpyObj('Platform', {
            'ready': new Promise((resolve) => resolve(true))
          }),
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', [
            'onPageLoad',
            'initWebServices',
          ]),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', [
            'set',
            'get',
            'setUser',
            'getConfig',
            'setConfig',
            'getUser',
            'lastVisited',
          ]),
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', {
            logout: undefined,
          }),
        },
        {
          provide: VersionCheckService,
          useValue: jasmine.createSpyObj('VersionCheckService', ['initiateVersionCheck']),
        },
      ],
    }).compileComponents();
    platformSpy = TestBed.inject(Platform);
    sharedServiceSpy = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    versionCheckServiceSpy = TestBed.inject(VersionCheckService) as jasmine.SpyObj<VersionCheckService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    // Provide safe defaults so ngOnInit's getConfig()/getUser() calls don't throw.
    // Individual tests may override these with more specific values.
    (storageSpy.getConfig as jasmine.Spy).and.returnValue({});
    (storageSpy.getUser as jasmine.Spy).and.returnValue({});
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'v3'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('v3');
  });

  describe('initializeApp()', () => {
    it('should check version on Production mode', fakeAsync(() => {
      (environment as any).production = true;
      TestBed.createComponent(AppComponent);
      tick();
      expect(platformSpy.ready).toHaveBeenCalled();
      expect(sharedServiceSpy.initWebServices).toHaveBeenCalled();
      expect(versionCheckServiceSpy.initiateVersionCheck).toHaveBeenCalled();
    }));

    it('should initialize the app', fakeAsync(() => {
      TestBed.createComponent(AppComponent);
      tick();
      expect(platformSpy.ready).toHaveBeenCalled();
      expect(sharedServiceSpy.initWebServices).toHaveBeenCalled();
    }));
  });

  describe('ngOnInit()', () => {
    it('should initialize app', fakeAsync(() => {
      storageSpy.get = jasmine.createSpy('storageSpy.get').and.callThrough();
      utilsSpy.getCurrentLocation = jasmine.createSpy('getCurrentURL').and.returnValue({
        domain: '',
        search: '?apikey=abcdefg'
      });
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();
      tick();
      expect(storageSpy.get).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalled();
    }));

    it('should restore branding from storage on init', fakeAsync(() => {
      storageSpy.getUser = jasmine.createSpy('getUser').and.returnValue({
        colors: { primary: '#ff0000' },
        institutionLogo: 'https://example.com/logo.png',
      });
      storageSpy.getConfig = jasmine.createSpy('getConfig').and.returnValue({});
      utilsSpy.getCurrentLocation = jasmine.createSpy('getCurrentURL').and.returnValue({
        domain: '',
        search: '?apikey=abcdefg'
      });
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();
      tick();
      expect(storageSpy.getUser).toHaveBeenCalled();
      expect(storageSpy.setConfig).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalled();
    }));

    it('should initiate secure login (direct login)', fakeAsync(() => {
      storageSpy.get = jasmine.createSpy('storageSpy.get').and.callThrough();
      utilsSpy.getCurrentLocation = jasmine.createSpy('getCurrentURL').and.returnValue({
        domain: '',
        search: '?do=secure&auth_token=abcdefg'
      });

      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();
      tick();
      expect(storageSpy.get).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalled();
    }));

    it('should initiate reset password', fakeAsync(() => {
      storageSpy.get = jasmine.createSpy('storageSpy.get').and.callThrough();
      utilsSpy.getCurrentLocation = jasmine.createSpy('getCurrentURL').and.returnValue({
        domain: '',
        search: '?do=resetpassword&key=abcdefg&email=dummy@email.com'
      });

      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();
      tick();
      expect(storageSpy.get).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalled();
    }));

    it('should initiate registration', fakeAsync(() => {
      storageSpy.get = jasmine.createSpy('storageSpy.get').and.callThrough();
      utilsSpy.getCurrentLocation = jasmine.createSpy('getCurrentURL').and.returnValue({
        domain: '',
        hash: '/?do=registration&key=abcdefg&email=dummy2@email.com'
      });

      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();
      tick();
      expect(storageSpy.get).toHaveBeenCalled();
      expect(authSpy.logout).toHaveBeenCalled();
    }));
  });
});
