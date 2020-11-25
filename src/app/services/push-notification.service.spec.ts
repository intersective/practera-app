import { TestBed, flush, fakeAsync } from '@angular/core/testing';
import { PushNotificationService, PermissionTypes } from './push-notification.service';
import { RequestService } from '@shared/request/request.service';
import { Router, RouterStateSnapshot } from '@angular/router';
import { BrowserStorageService } from '@services/storage.service';
import { environment } from '@environments/environment';

import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  LocalNotificationEnabledResult,
  PushNotificationsPlugin,
  PushNotificationDeliveredList,
  NotificationPermissionResponse,
  Capacitor,
} from '@capacitor/core';

const { PushNotifications, LocalNotifications, PusherBeams, Permissions } = Plugins;


describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let storageSpy: BrowserStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PushNotificationService,
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['set'])
        },
      ]
    });
    service = TestBed.inject(PushNotificationService) as jasmine.SpyObj<PushNotificationService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialise some listener altogether', fakeAsync(() => {
    service.requestPermission = jasmine.createSpy('requestPermission');
    service.registerToServer = jasmine.createSpy('registerToServer');
    service.listenToError = jasmine.createSpy('listenToError');
    service.listenToReceiver = jasmine.createSpy('listenToReceiver');
    service.listenToActionPerformed = jasmine.createSpy('listenToActionPerformed');
    service.initiatePushNotification().then(() => {
      expect(service.requestPermission).toHaveBeenCalled();
      expect(service.registerToServer).toHaveBeenCalled();
      expect(service.listenToError).toHaveBeenCalled();
      expect(service.listenToReceiver).toHaveBeenCalled();
      expect(service.listenToActionPerformed).toHaveBeenCalled();
    });
    flush();
  }));

  describe('hasPermission()', () => {
    beforeEach(() => {
      // Capacitor.isPluginAvailable = () => true;

      /*PushNotifications.requestPermission = (): Promise<NotificationPermissionResponse> => {
        console.log('from spec?');
        return new Promise(resolve => {
          console.log('from specasd?');
          return resolve({ granted: false });
        });
      };*/
    });

    it('should return true when permission is allowed', fakeAsync(() => {

      /*PushNotifications.requestPermission = jasmine.createSpy('requestPermission').and.returnValue(new Promise(resolve => resolve({
        granted: true
      })));*/
      Permissions.query = () => new Promise(resolve => resolve({
        state: 'granted'
      }));
      PushNotifications.requestPermission = () => new Promise(resolve => resolve({
        granted: true
      }));
      service = new PushNotificationService(storageSpy);
      service['pushNotificationPlugin'] = PushNotifications;

      service.hasPermission().then(hasPermission => {
        // jasmine is testing from Browser platform,
        // and to the returned "permission" is certainly a "false"
        // capacitor's PushNotification plugin only available on device
        expect(hasPermission).toBeTruthy();
      });
      flush();
    }));

    it('should return false when permission is disallowed', fakeAsync(() => {
      Permissions.query = () => new Promise(resolve => resolve({
        state: 'denied'
      }));
      PushNotifications.requestPermission = () => new Promise(resolve => resolve({
        granted: false
      }));
      service = new PushNotificationService(storageSpy);
      service['pushNotificationPlugin'] = PushNotifications;

      service.hasPermission().then(hasPermission => {
        expect(hasPermission).toBeFalsy();
      });
      flush();
    }));
  });

  describe('requestPermission()', () => {
    it('should register to push notification plugin when permission granted', fakeAsync(() => {

      PushNotifications.requestPermission = jasmine.createSpy('requestPermission').and.returnValue(new Promise(resolve => resolve({
        granted: true
      })));
      PushNotifications.register = jasmine.createSpy();

      service = new PushNotificationService(storageSpy);
      service['pushNotificationPlugin'] = PushNotifications;
      service.requestPermission().then(() => {
        expect(PushNotifications.requestPermission).toHaveBeenCalled();
        expect(storageSpy.set).toHaveBeenCalled();
        expect(PushNotifications.register).toHaveBeenCalled();
      });
      flush();
    }));
  });

  describe('associateDeviceToUser()', () => {
    it('should associate user to device', fakeAsync(() => {
      const APPKEY = 'testAppkey';
      const ID = 'testID';
      const TOKEN = 'testToken';

      PusherBeams.setUserID = jasmine.createSpy('setUserID').and.returnValue(new Promise(resolve => resolve(true)));

      environment.appkey = APPKEY;
      const service = new PushNotificationService(storageSpy);
      service['pusherBeams'] = PusherBeams;

      service.associateDeviceToUser(ID, TOKEN).then(res => {
        expect(PusherBeams.setUserID).toHaveBeenCalledWith(jasmine.objectContaining({
            userID: ID,
            headers: {
              appkey: APPKEY,
              apikey: TOKEN,
            },
            beamsAuthURL: 'https://wchpiwp904.execute-api.us-east-2.amazonaws.com/beams'
        }));
        expect(res).toBeTruthy();
      });
    }));
  });

  describe('promptForPermission()', () => {
    it('should return false if plugin not available', fakeAsync(() => {
      Capacitor.isPluginAvailable = () => false;
      const snapshot: Partial<RouterStateSnapshot> = {
        url: 'doesNotMatter'
      };
      service.promptForPermission(PermissionTypes.firstVisit, snapshot).then(res => {
        expect(res).toBeFalsy();
      });
      flush();
    }));

    it('should prompt user for push notification permission', fakeAsync(() => {
      Capacitor.isPluginAvailable = () => true;
      const visited = [
        'url1',
        'url2',
      ];

      storageSpy.get = jasmine.createSpy('get').and.returnValue(visited);

      Permissions.query = () => new Promise(resolve => resolve({
        state: 'granted'
      }));

      PushNotifications.requestPermission = () => new Promise(resolve => resolve({
        granted: true
      }));

      const snapshot: Partial<RouterStateSnapshot> = {
        url: 'url3'
      };

      const service = new PushNotificationService(storageSpy);
      service['pushNotificationPlugin'] = PushNotifications;
      service.promptForPermission(PermissionTypes.firstVisit, snapshot).then(() => {
        expect(storageSpy.set).toHaveBeenCalledWith('visited', [...visited, 'url3']);
      });
      flush();
    }));
  });
});

