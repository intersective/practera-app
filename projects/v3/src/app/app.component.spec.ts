import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Platform } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { SharedService } from './services/shared.service';
import { BrowserStorageService } from './services/storage.service';
import { UtilsService } from './services/utils.service';
import { VersionCheckService } from './services/version-check.service';

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
          useValue: jasmine.createSpyObj('Platform', ['']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['']),
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', ['']),
        },
        {
          provide: NgZone,
          useValue: jasmine.createSpyObj('NgZone', ['']),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['']),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['']),
        },
        {
          provide: DomSanitizer,
          useValue: jasmine.createSpyObj('DomSanitizer', ['']),
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['']),
        },
        {
          provide: VersionCheckService,
          useValue: jasmine.createSpyObj('VersionCheckService', ['']),
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

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('v3 app is running!');
  });
});
