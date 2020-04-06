import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthResetPasswordComponent } from './auth-reset-password.component';
import { AuthService } from '../auth.service';
import { Observable, of, pipe, throwError } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { UtilsService } from '@services/utils.service';
import { Router, ActivatedRoute, UrlSerializer } from '@angular/router';
import { ActivatedRouteStub } from '@testing/activated-route-stub';
import { NotificationService } from '@shared/notification/notification.service';
import { BrowserStorageService } from '@services/storage.service';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserStorageServiceMock } from '@testing/mocked.service';

describe('AuthResetPasswordComponent', () => {
  let component: AuthResetPasswordComponent;
  let fixture: ComponentFixture<AuthResetPasswordComponent>;
  let serviceSpy: jasmine.SpyObj<AuthService>;
  let utils: UtilsService;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule,  ReactiveFormsModule],
      declarations: [ AuthResetPasswordComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Location,
        {
          provide: LocationStrategy,
          useClass: PathLocationStrategy
        },
        UrlSerializer,
        UtilsService,
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['verifyResetPassword', 'resetPassword'])
        },
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['alert', 'presentToast', 'popUp'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({ key: 'abc', email: 'abc@test.com' })
        }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthResetPasswordComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    utils = TestBed.inject(UtilsService);
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routeSpy = TestBed.inject(ActivatedRoute);
    serviceSpy.verifyResetPassword.and.returnValue(of({}));
    serviceSpy.resetPassword.and.returnValue(of({}));
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing ngOnInit()', () => {
    it('should pop up alert and redirect if no key or email passed', () => {
      const params = {
        key: null,
        email: 'abc@test.com'
      };
      routeSpy.snapshot.paramMap.get = jasmine.createSpy().and.callFake(key => params[key]);
      fixture.detectChanges();
      expect(notificationSpy.alert.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.first().args[0].message).toContain('Invalid');
      notificationSpy.alert.calls.first().args[0].buttons[0].handler();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['login']);
    });
    it('should verify success', () => {
      fixture.detectChanges();
      expect(component.verifySuccess).toBe(true);
    });
    it('should pop up alert and redirect if verify resetpassword failed', () => {
      serviceSpy.verifyResetPassword.and.returnValue(throwError(''));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(notificationSpy.alert.calls.count()).toBe(1);
        expect(notificationSpy.alert.calls.first().args[0].message).toContain('Invalid');
        notificationSpy.alert.calls.first().args[0].buttons[0].handler();
        expect(routerSpy.navigate.calls.first().args[0]).toEqual(['login']);
      });
    });
  });

  describe('when testing resetPassword()', () => {
    beforeEach(() => {
      component.key = 'abc';
      component.email = 'abc@test.com',
      component.resetPasswordForm.setValue({email: 'abc@test.com', password: 'aaa', confirmPassword: 'aaa'});
    });
    it('should pop up success and redirect', () => {
      component.resetPassword();
      expect(notificationSpy.alert.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.first().args[0].message).toContain('successfully');
      notificationSpy.alert.calls.first().args[0].buttons[0].handler();
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['login']);
    });
    it('should pop up alert if password compromised', fakeAsync(() => {
      serviceSpy.resetPassword.and.returnValue(throwError({
        data: {type: 'password_compromised'}
      }));
      component.resetPassword();
      tick();
      expect(notificationSpy.alert.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.first().args[0].message).toContain('insecure passwords');
    }));
    it('should pop up alert if reset password failed', () => {
      serviceSpy.resetPassword.and.returnValue(throwError(''));
      component.resetPassword();
      expect(notificationSpy.presentToast.calls.count()).toBe(1);
    });
  });
  describe('when testing checkPasswordMatching()', () => {
    it('should return true if password match', () => {
      component.resetPasswordForm.setValue({email: 'abc@test.com', password: 'aaa', confirmPassword: 'aaa'});
      expect(component.checkPasswordMatching(component.resetPasswordForm)).toBe(null);
    });
    it('should return false if password not match', () => {
      component.resetPasswordForm.setValue({email: 'abc@test.com', password: 'aaa', confirmPassword: 'aaaa'});
      expect(component.checkPasswordMatching(component.resetPasswordForm)).toEqual({notMatching: true});
    });
  });
});

