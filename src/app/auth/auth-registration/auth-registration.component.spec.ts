import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BrowserStorageService } from '@app/services/storage.service';
import { UtilsService } from '@app/services/utils.service';
import { NewRelicService } from '@app/shared/new-relic/new-relic.service';
import { NotificationService } from '@app/shared/notification/notification.service';
import { SwitcherService } from '@app/switcher/switcher.service';
import { ModalController } from '@ionic/angular';
import { TestUtils } from '@testing/utils';
import { of } from 'rxjs';
import { AuthService } from '../auth.service';

import { AuthRegistrationComponent } from './auth-registration.component';

describe('AuthRegistrationComponent', () => {
  let component: AuthRegistrationComponent;
  let fixture: ComponentFixture<AuthRegistrationComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthRegistrationComponent ],
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
            verifyRegistration: of(true),
            checkDomain: of(true),
            deeplink: 'some value',
            login: of(true),
          }
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: NotificationService,
          useValue: {
            alert: of(true)
          }
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
            switchProgramAndNavigate: Promise.resolve(true)
          }
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
