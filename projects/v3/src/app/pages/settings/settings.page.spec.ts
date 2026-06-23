import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@v3/services/auth.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { FilestackService } from '@v3/services/filestack.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { SettingsPage } from './settings.page';
import { HubspotService } from '../../services/hubspot.service';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;
  let hubspotServiceSpy: jasmine.SpyObj<HubspotService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: HubspotService,
          useValue: jasmine.createSpyObj('HubspotService', ['openSupportPopup']),
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({}),
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['logout', 'updateProfileImage']),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getUser': jasmine.createSpy('getUser'),
            'get': jasmine.createSpy('get'),
            'setUser': jasmine.createSpy('setUser'),
          }),
        },
        {
          provide: UtilsService,
          useClass: TestUtils
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert']),
        },
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj('FilestackService', ['getFileTypes']),
        },
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['dismiss']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call openSupportPopup on a KeyboardEvent that is not Enter or Space', () => {
    component.openSupportPopup(new KeyboardEvent('keydown', { key: 'a' }));
    expect(hubspotServiceSpy.openSupportPopup).not.toHaveBeenCalled();
  });

  it('should call openSupportPopup when hubspotActivated is true', () => {
    component.hubspotActivated = true;
    component.openSupportPopup(new Event('click'));
    expect(hubspotServiceSpy.openSupportPopup).toHaveBeenCalledWith({ formOnly: true });
  });
});
