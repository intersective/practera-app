import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthLoginComponent } from './auth-login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { NotificationService } from '@shared/notification/notification.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockNewRelicService } from '@testing/mocked.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@app/services/utils.service';
import { TestUtils } from '@testing/utils';

describe('AuthLoginComponent', () => {
  let component: AuthLoginComponent;
  let fixture: ComponentFixture<AuthLoginComponent>;
  let serviceSpy: jasmine.SpyObj<AuthService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let newRelicSpy: jasmine.SpyObj<NewRelicService>;
  let storage: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ AuthLoginComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
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
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', [
            'stacks',
            'loginApiKey',
            'set'
          ])
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
    newRelicSpy = TestBed.inject(NewRelicService) as jasmine.SpyObj<NewRelicService>;
    storage = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  const mockStacks = [
    {
      uuid: 'b0f6328e-379c-4cd2-9e96-1363a49ab001',
      name: 'Practera Classic App - Stage',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'https://app.p1-stage.practera.com',
      type: 'app',
      coreApi: 'https://admin.p1-stage.practera.com',
      coreGraphQLApi: 'https://core-graphql-api.p1-stage.practera.com',
      chatApi: 'https://chat-api.p1-stage.practera.com',
      filestack: {
        s3Config: {
          container: 'files.p1-stage.practera.com',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS',
      lastLogin: 1619660600368
    },
    {
      uuid: '9c31655d-fb73-4ea7-8315-aa4c725b367e',
      name: 'Practera Classic App - Sandbox',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'https://app.p1-sandbox.practera.com',
      type: 'app',
      coreApi: 'https://admin.p1-sandbox.practera.com',
      coreGraphQLApi: 'https://core-graphql-api.p1-sandbox.practera.com',
      chatApi: 'https://chat-api.p1-sandbox.practera.com',
      filestack: {
        s3Config: {
          container: 'files.p1-sandbox.practera.com',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS',
      lastLogin: 1619660600368
    },
    {
      uuid: 'f4f85069-ca3b-4044-905a-e366b724af6b',
      name: 'Practera App - Local Development',
      description: 'Participate in an experience as a learner or reviewer - Local',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'http://127.0.0.1:4200/',
      type: 'app',
      coreApi: 'http://127.0.0.1:8080',
      coreGraphQLApi: 'http://127.0.0.1:8000',
      chatApi: 'http://localhost:3000/local/graphql',
      filestack: {
        s3Config: {
          container: 'practera-aus',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS',
      lastLogin: 1619660600368
    }
  ];

  describe('when testing login()', () => {
    it('should pop up alert if username is empty', () => {
      component.loginForm.setValue({username: '', password: 'abc'});
      notificationSpy.alert.and.returnValue(Promise.resolve());
      component.login();
      expect(notificationSpy.alert.calls.count()).toBe(1);

      const button = notificationSpy.alert.calls.first().args[0].buttons[0];
      (typeof button == 'string') ? button : button.handler(true);

      expect(component.isLoggingIn).toBe(false);
    });

    it('should save return data in storage and navigate to switcher page after successfully login', fakeAsync(() => {
      component.loginForm.setValue({username: 'test@test.com', password: 'abc'});
      serviceSpy.login.and.returnValue(of({
        apikey: '123456',
        stacks: mockStacks
      }));
      component.login();
      tick();
      expect(serviceSpy.login.calls.count()).toBe(1);
      expect(storage.stacks).toEqual(mockStacks);
      expect(storage.loginApiKey).toEqual('123456');
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['switcher', 'switcher-program']);
    }));

    it('should pop up password compromised alert if LOGIN API login failed', fakeAsync(() => {
      component.loginForm.setValue({username: 'test@test.com', password: 'abc'});
      serviceSpy.login.and.returnValue(throwError({
        status: 400,
        error: {passwordCompromised: true}
      }));
      component.login();
      tick();
      expect(serviceSpy.login.calls.count()).toBe(1);
      expect(component.isLoggingIn).toBe(false);
      expect(notificationSpy.alert.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.first().args[0].message).toContain('insecure passwords');
    }));

    it(`should pop up 'incorrect' alert if login failed`, fakeAsync(() => {
      component.loginForm.setValue({username: 'test@test.com', password: 'abc'});
      serviceSpy.login.and.returnValue(throwError({}));
      component.login();
      tick();
      expect(serviceSpy.login.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.count()).toBe(1);
      expect(notificationSpy.alert.calls.first().args[0].message).toContain('password is incorrect');

      const button = notificationSpy.alert.calls.first().args[0].buttons[0];
      (typeof button == 'string') ? button : button.handler(true);

      expect(component.isLoggingIn).toBe(false);
    }));
  });
});

