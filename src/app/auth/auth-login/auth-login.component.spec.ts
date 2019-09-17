import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthLoginComponent } from './auth-login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Observable, of, pipe, throwError } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { NotificationService } from '@shared/notification/notification.service';
import { ReactiveFormsModule } from '@angular/forms';

describe('AuthLoginComponent', () => {
  let component: AuthLoginComponent;
  let fixture: ComponentFixture<AuthLoginComponent>;
  let serviceSpy: jasmine.SpyObj<AuthService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, ReactiveFormsModule],
      declarations: [ AuthLoginComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['login'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['alert'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of(),
            routerState: {root: {}}
          }
        }
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthLoginComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.get(AuthService);
    notificationSpy = TestBed.get(NotificationService);
    routerSpy = TestBed.get(Router);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing login()', () => {
    it('should pop up alert if email is empty', () => {
      component.loginForm.setValue({email: '', password: 'abc'});
      notificationSpy.alert.and.returnValue(true);
      component.login();
      expect(notificationSpy.alert.calls.count()).toBe(1);
      notificationSpy.alert.calls.first().args[0].buttons[0].handler();
      expect(component.isLoggingIn).toBe(false);
    });

    it('should navigate to program switcher page if login successfully', () => {
      component.loginForm.setValue({email: 'test@test.com', password: 'abc'});
      serviceSpy.login.and.returnValue(of({}));
      component.login();
      expect(serviceSpy.login.calls.count()).toBe(1);
      expect(component.isLoggingIn).toBe(false);
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['switcher']);
    });

    it('should pop up password compromised alert if login failed', () => {
      component.loginForm.setValue({email: 'test@test.com', password: 'abc'});
      serviceSpy.login.and.returnValue(throwError({data: {type: 'password_compromised'}}));
      component.login();
      expect(serviceSpy.login.calls.count()).toBe(1);
      expect(component.isLoggingIn).toBe(false);
      expect(notificationSpy.alert.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.first().args[0].message).toContain('insecure passwords');
    });

    it(`should pop up 'incorrect' alert if login failed`, () => {
      component.loginForm.setValue({email: 'test@test.com', password: 'abc'});
      serviceSpy.login.and.returnValue(throwError({}));
      component.login();
      expect(serviceSpy.login.calls.count()).toBe(1);
      expect(component.isLoggingIn).toBe(true);
      expect(notificationSpy.alert.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.first().args[0].message).toContain('password is incorrect');
      notificationSpy.alert.calls.first().args[0].buttons[0].handler();
      expect(component.isLoggingIn).toBe(false);
    });
  });
});

