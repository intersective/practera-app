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
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { MockRouter } from '@testing/mocked.service';
import { Apollo } from 'apollo-angular';


describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsSpy: jasmine.SpyObj<SettingService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let fastFeedbackSpy: jasmine.SpyObj<FastFeedbackService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let newRelicSpy: jasmine.SpyObj<NewRelicService>;
  let utils: UtilsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, HttpClientModule ],
      declarations: [ SettingsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
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
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser', 'setUser', 'get'])
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['logout'])
        },
        {
          provide: NewRelicService,
          useValue: jasmine.createSpyObj('NewRelicService', ['setPageViewName', 'actionText', 'noticeError'])
        },
        {
          provide: Router,
          useClass: MockRouter
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    settingsSpy = TestBed.inject(SettingService) as jasmine.SpyObj<SettingService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    utils = TestBed.inject(UtilsService);
    fastFeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    newRelicSpy = TestBed.inject(NewRelicService) as jasmine.SpyObj<NewRelicService>;

    storageSpy.getUser.and.returnValue({
      email: 'test@test.com',
      contactNumber: '1234455',
      image: 'abc',
      name: 'student',
      programName: 'program'
    });

    storageSpy.get.and.returnValue([]);

    fastFeedbackSpy.pullFastFeedback.and.returnValue(of({}));
    newRelicSpy.actionText.and.returnValue('');
    newRelicSpy.setPageViewName.and.returnValue('');
    newRelicSpy.noticeError.and.returnValue('');
    component.routeUrl = '/test';
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('when testing onEnter(), it should get correct data', () => {
    spyOn<any>(component, '_getCurrentProgramImage').and.returnValue('');
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
    component.switchProgram();
    expect(routerSpy.navigate.calls.first().args[0]).toEqual(['switcher', 'switcher-program']);
  });

  it('should allow access to T&C file', () => {
    spyOn(window, 'open');
    component.openLink();
    expect(component.termsUrl).toEqual('https://images.practera.com/terms_and_conditions/practera_terms_conditions.pdf');
    expect(window.open).toHaveBeenCalledWith(component.termsUrl, '_system');
  });

  it('should initiate support email event', () => {
    spyOn(window, 'open');
    component.mailTo();
    expect(component.helpline).toEqual('help@practera.com');
    expect(window.open).toHaveBeenCalledWith(`mailto:${component.helpline}?subject=${component.currentProgramName}`, '_self');
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

