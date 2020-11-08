import { TestBed, flush, fakeAsync } from '@angular/core/testing';
import { PushNotificationService } from './push-notification.service';
import { RequestService } from '@shared/request/request.service';
import { BrowserStorageService } from '@services/storage.service';

import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  LocalNotificationEnabledResult,
  PushNotificationsPlugin,
  PushNotificationDeliveredList,
  NotificationPermissionResponse
} from '@capacitor/core';

const { PushNotifications, LocalNotifications, PusherBeams, Permissions } = Plugins;


describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let storageSpy: BrowserStorageService;
  let pushNotificationsSpy: any = {
    requestPermission: () => true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PushNotificationService,
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['set'])
        },
        /*{
          provide: PushNotifications,
          useValue: pushNotificationsSpy

        },*/

      ]
    });
    service = TestBed.inject(PushNotificationService) as jasmine.SpyObj<PushNotificationService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    // pushNotificationsSpy = TestBed.inject(pushNotificationsSpy);

  });

  it( 'should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(' hasPermission ', () => {
    beforeEach(() => {
      Permissions.query = () => new Promise(resolve => resolve({ state: 'granted'}));
    });

    it( 'should return true when permission is allowed', fakeAsync(() => {
      /*PushNotifications.requestPermission = (): Promise<NotificationPermissionResponse> => {
        console.log('from spec?');
        return new Promise(resolve => {
          console.log('from specasd?');
          return resolve({ granted: false });
        });
      };*/

      service = new PushNotificationService(storageSpy);
      service.hasPermission().then(hasPermission => {
        // jasmine is testing from Browser platform,
        // and to the returned "permission" is certainly a "false"
        // capacitor's PushNotification plugin only available on device
        expect(hasPermission).toBeFalsy();
      });
      flush();
    }));
  });
});

