import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/auth/auth.service';
import { BrowserStorageService } from '@app/services/storage.service';
import { UtilsService } from '@app/services/utils.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { FilestackService } from '@v3/app/services/filestack.service';
import { NotificationsService } from '@v3/app/services/notifications.service';

import { SettingsPage } from './settings.page';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: ActivatedRoute,
          useClass: ActivatedRouteStub,
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['']),
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
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['']),
        },
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj('FilestackService', ['']),
        },
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
