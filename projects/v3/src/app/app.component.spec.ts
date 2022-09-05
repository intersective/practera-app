import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
            ready: Promise.resolve(true),
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
            getConfig: of(true),
          }),
        },
        {
          provide: VersionCheckService,
          useValue: jasmine.createSpyObj('VersionCheckService', ['initiateVersionCheck']),
        },
      ],
    }).compileComponents();
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
});
