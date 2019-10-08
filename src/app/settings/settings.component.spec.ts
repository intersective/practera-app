import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { SettingService } from './setting.service';
import { Observable, of, pipe, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { FilestackService } from '@shared/filestack/filestack.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { BrowserStorageService } from '@services/storage.service';
import { AuthService } from '../auth/auth.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsSpy: jasmine.SpyObj<SettingService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let fastFeedbackSpy: jasmine.SpyObj<FastFeedbackService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let utils: UtilsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, HttpClientModule ],
      declarations: [ SettingsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        UtilsService,
        FilestackService,
        {
          provide: SettingService,
          useValue: jasmine.createSpyObj('SettingService', ['updateProfileImage'])
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', ['pullFastFeedback'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser', 'setUser'])
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['logout'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    settingsSpy = TestBed.get(SettingService);
    routerSpy = TestBed.get(Router);
    utils = TestBed.get(UtilsService);
    fastFeedbackSpy = TestBed.get(FastFeedbackService);
    storageSpy = TestBed.get(BrowserStorageService);
    authSpy = TestBed.get(AuthService);

    storageSpy.getUser.and.returnValue({
      email: 'test@test.com',
      contactNumber: '1234455',
      image: 'abc',
      name: 'student',
      programName: 'program'
    });
    fastFeedbackSpy.pullFastFeedback.and.returnValue(of({}));
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('when testing onEnter(), it should get correct data.', () => {
    fixture.detectChanges();
    expect(component.profile).toEqual({
      email: 'test@test.com',
      contactNumber: '1234455',
      image: 'abc',
      name: 'student'
    });
    expect(component.acceptFileTypes).toEqual('image/*');
    expect(component.currentProgramName).toEqual('program');
    expect(fastFeedbackSpy.pullFastFeedback.calls.count()).toBe(1);
  });

  it('should navigate to switcher page', () => {
    component.openLink();
    component.switchProgram();
    component.mailTo();
    expect(routerSpy.navigate.calls.first().args[0]).toEqual(['/switcher']);
  });

  it('when testing logout(), it should call auth service logout', () => {
    component.logout();
    authSpy.logout.and.returnValue({});
    expect(authSpy.logout.calls.count()).toBe(1);
  });

  describe('when testing uploadProfileImage()', () => {
    it('should upload image successfully', () => {
      settingsSpy.updateProfileImage.and.returnValue(of({}));
      component.uploadProfileImage({success: true, data: {url: 'abc'}});
      expect(settingsSpy.updateProfileImage.calls.count()).toBe(1);
    });

    it('should return error pop up #1', () => {
      settingsSpy.updateProfileImage.and.returnValue(of({}));
      component.uploadProfileImage({success: false, data: {url: 'abc'}});
    });

    it('should return error pop up #2', () => {
      settingsSpy.updateProfileImage.and.returnValue(throwError(''));
      component.uploadProfileImage({success: true, data: {url: 'abc'}});
    });
  });
});

