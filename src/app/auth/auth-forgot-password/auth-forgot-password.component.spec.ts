import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthForgotPasswordComponent } from './auth-forgot-password.component';
import { AuthService } from '../auth.service';
import { Observable, of, pipe, throwError } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';

describe('AuthForgotPasswordComponent', () => {
  let component: AuthForgotPasswordComponent;
  let fixture: ComponentFixture<AuthForgotPasswordComponent>;
  let serviceSpy: jasmine.SpyObj<AuthService>;
  let utils: UtilsService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [ AuthForgotPasswordComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        UtilsService,
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['forgotPassword'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['get', 'getConfig'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['alert', 'presentToast', 'popUp'])
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthForgotPasswordComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.get(AuthService);
    utils = TestBed.get(UtilsService);
    notificationSpy = TestBed.get(NotificationService);
    storageSpy = TestBed.get(BrowserStorageService);
    storageSpy.getConfig.and.returnValue({logo: null});
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing send()', () => {

    beforeEach(() => {
      component.email = 'test@test.com';
    });

    it('should pop up toast message if email is empty', fakeAsync(() => {
      notificationSpy.presentToast.and.returnValue(true);
      component.email = '';
      component.send();
      expect(notificationSpy.presentToast.calls.count()).toBe(1);
    }));

    it('should pop up forgot password confirmation if success', fakeAsync(() => {
      serviceSpy.forgotPassword.and.returnValue(of({}));
      component.send();
      expect(component.isSending).toBe(false);
      expect(notificationSpy.popUp.calls.count()).toBe(1);
      expect(notificationSpy.popUp.calls.first().args[1]).toEqual({email: component.email});
    }));

    it('should pop up reset too frequently alert if forgot password failed', fakeAsync(() => {
      serviceSpy.forgotPassword.and.returnValue(throwError({
        data: {
          type: 'reset_too_frequently'
        }
      }));
      component.send();
      expect(component.isSending).toBe(false);
      expect(notificationSpy.alert.calls.count()).toBe(1);
    }));

    it('should pop up try again alert if forgot password failed', fakeAsync(() => {
      serviceSpy.forgotPassword.and.returnValue(throwError({}));
      component.send();
      expect(component.isSending).toBe(false);
      expect(notificationSpy.presentToast.calls.count()).toBe(1);
    }));
  });
});

