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

describe('AppComponent', () => {
  let sharedServiceSpy: SharedService;
  let utilsSpy: UtilsService;
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
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
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

  it('should initialize the app', fakeAsync(() => {
    TestBed.createComponent(AppComponent);
    tick();
    expect(platformSpy.ready).toHaveBeenCalled();
    expect(sharedServiceSpy.initWebServices).toHaveBeenCalled();
  }));

  describe('ngOnInit()', () => {
    it('should initialize app', fakeAsync(() => {
      utilsSpy.getCurrentLocation = jasmine.createSpy('getCurrentURL').and.returnValue({
        domain: '',
        search: '?apikey=abcdefg'
      });
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();
      tick();
      // storageSpy
    }));
  });
});
