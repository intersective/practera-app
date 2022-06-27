import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, flushMicrotasks } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BrowserStorageService } from '@app/services/storage.service';
import { UtilsService } from '@app/services/utils.service';
import { NewRelicService } from '@app/shared/new-relic/new-relic.service';
import { NotificationService } from '@app/shared/notification/notification.service';
import { SharedModule } from '@app/shared/shared.module';
import { SwitcherService } from '@app/switcher/switcher.service';
import { ModalController } from '@ionic/angular';
import { TestUtils } from '@testing/utils';
import { of } from 'rxjs';
import { AuthService } from '../auth.service';

import { AuthRegistrationComponent } from './auth-registration.component';

describe('AuthRegistrationComponent', () => {
  let component: AuthRegistrationComponent;
  let fixture: ComponentFixture<AuthRegistrationComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, ReactiveFormsModule ],
      declarations: [ AuthRegistrationComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(true),
            snapshot: {
              paramMap: convertToParamMap({
                email: 'test@practera.com',
                key: 'abcdefg',
              })
            }
          }
        },
        {
          provide: AuthService,
          useValue: {
            saveRegistration: () => of(true),
            verifyRegistration: () => of(true),
            checkDomain: () => of(true),
            deeplink: 'some value',
            login: () => of(true),
          }
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['popUp', 'alert']),
        },
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['create'])
        },
        BrowserStorageService,
        NewRelicService,
        {
          provide: SwitcherService,
          useValue: {
            switchProgramAndNavigate: () => Promise.resolve(true)
          }
        },
      ]
    })
    .compileComponents();
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register', fakeAsync(() => {
    component.unRegisteredDirectLink = true;
    component.isAgreed = true;
    component.password = 'dummy_password';
    component.register();

    flushMicrotasks();

    expect(authServiceSpy.deeplink).toBeNull();
  }));
});
