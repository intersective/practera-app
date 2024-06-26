import { NgZone } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
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

describe('AppComponent', async () => {
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
          ]),
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: DomSanitizer,
          useValue: jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml']),
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', {
            getConfig: of({data: []}),
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

  describe('initializeApp()', async () => {
    it('should check version on Production mode', fakeAsync(() => {
      environment.production = true;
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

    it('should initialize app with config', fakeAsync(() => {
      storageSpy.get = jasmine.createSpy('storageSpy.get').and.callThrough();
      authSpy.getConfig = jasmine.createSpy('getConfig').and.returnValue(of({ data: [
        {
          logo: '',
          config: {
            html_branding: {
              header: '',
              theme_color: '',
            }
          }
        }
      ] }));
      utilsSpy.getCurrentLocation = jasmine.createSpy('getCurrentURL').and.returnValue({
        domain: '',
        search: '?apikey=abcdefg'
      });
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();
      tick();
      expect(storageSpy.get).toHaveBeenCalled();
      expect(storageSpy.setConfig).toHaveBeenCalled();
      expect(storageSpy.getUser).toHaveBeenCalled();
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
      expect(routerSpy.navigate).toHaveBeenCalled();
    }));
  });
});
