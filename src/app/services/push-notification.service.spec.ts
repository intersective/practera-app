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
  PushNotificationDeliveredList
} from '@capacitor/core';

const { PushNotifications, LocalNotifications, PusherBeams } = Plugins;


xdescribe('PushNotificationService', () => {
  let service: PushNotificationService;
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
        {
          provide: PushNotifications,
          useValue: pushNotificationsSpy

        },

      ]
    });
    service = TestBed.inject(PushNotificationService) as jasmine.SpyObj<PushNotificationService>;
    pushNotificationsSpy = TestBed.inject(pushNotificationsSpy);

  });

  it( 'should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(' hasPermission ', () => {
    it( 'should return true when permission is allowed', fakeAsync(() => {
      service.hasPermission().then( res => {
        console.log('test');
        // expect(res.granted).toBeTruthy();
        expect(pushNotificationsSpy.requestPermission().toHaveBeenCalled());
      });
    }));
  });
});

