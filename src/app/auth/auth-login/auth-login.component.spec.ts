import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthLoginComponent } from './auth-login.component';
import { AuthService } from '../auth.service';
import { SwitcherService } from '../../switcher/switcher.service';
import { Router } from '@angular/router';
import { Observable, of, pipe, throwError } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { NotificationService } from '@shared/notification/notification.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockNewRelicService } from '@testing/mocked.service';
import { Apollo } from 'apollo-angular';

describe('AuthLoginComponent', () => {
  let component: AuthLoginComponent;
  let fixture: ComponentFixture<AuthLoginComponent>;
  let serviceSpy: jasmine.SpyObj<AuthService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let switcherServiceSpy: jasmine.SpyObj<SwitcherService>;
  let newRelicSpy: jasmine.SpyObj<NewRelicService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ AuthLoginComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
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
        },
        {
          provide: NewRelicService,
          useClass: MockNewRelicService
        },
        {
          provide: SwitcherService,
          useValue: jasmine.createSpyObj('SwitcherService', ['switchProgramAndNavigate'])
        }
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthLoginComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    switcherServiceSpy = TestBed.inject(SwitcherService) as jasmine.SpyObj<SwitcherService>;
    newRelicSpy = TestBed.inject(NewRelicService) as jasmine.SpyObj<NewRelicService>;
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

    it('should navigate to dashboard if have one program after successfully login', fakeAsync(() => {
      switcherServiceSpy.switchProgramAndNavigate.and.returnValue(['app', 'home']);
      component.loginForm.setValue({email: 'test@test.com', password: 'abc'});
      serviceSpy.login.and.returnValue(of({}));
      component.login();
      tick();
      expect(serviceSpy.login.calls.count()).toBe(1);
      expect(switcherServiceSpy.switchProgramAndNavigate.calls.count()).toBe(1);
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['app', 'home']);
    }));

    it('should pop up password compromised alert if login failed', fakeAsync(() => {
      component.loginForm.setValue({email: 'test@test.com', password: 'abc'});
      serviceSpy.login.and.returnValue(throwError({data: {type: 'password_compromised'}}));
      component.login();
      tick();
      expect(serviceSpy.login.calls.count()).toBe(1);
      expect(component.isLoggingIn).toBe(false);
      expect(notificationSpy.alert.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.first().args[0].message).toContain('insecure passwords');
    }));

    it(`should pop up 'incorrect' alert if login failed`, fakeAsync(() => {
      component.loginForm.setValue({email: 'test@test.com', password: 'abc'});
      serviceSpy.login.and.returnValue(throwError({}));
      component.login();
      tick();
      expect(serviceSpy.login.calls.count()).toBe(1);
      expect(component.isLoggingIn).toBe(true);
      expect(notificationSpy.alert.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.first().args[0].message).toContain('password is incorrect');
      notificationSpy.alert.calls.first().args[0].buttons[0].handler();
      expect(component.isLoggingIn).toBe(false);
    }));
  });
});

