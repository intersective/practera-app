import { TestBed, flush, fakeAsync } from '@angular/core/testing';
import { PushNotificationService } from './push-notification.service';
import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { Observable, interval, pipe } from 'rxjs';
import { switchMap, concatMap, tap, retryWhen, take, delay } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { BrowserStorageService } from '@services/storage.service';
import { Apollo } from 'apollo-angular';
import { environment } from '@environments/environment';
import {
  PluginRegistry,
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  LocalNotificationEnabledResult,
  PushNotificationsPlugin
} from '@capacitor/core';

const { PushNotifications, LocalNotifications, PusherBeams } = Plugins;

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let pushNotificationsSpy: jasmine.SpyObj<PushNotifications>;
  let pusherBeamsSpy: jasmine.SpyObj<PusherBeams>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Apollo,
        PushNotificationService,
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['set'])
        },
        {
          provide: PushNotifications,
          useValue: jasmine.createSpyObj('PushNotifications', ['requestPermission'])
        },
        {
          provide: PusherBeams,
          useValue: jasmine.createSpyObj('PusherBeams', [])
        }
      ]
    });
    service = TestBed.inject(PushNotificationService) as jasmine.SpyObj<PushNotificationService>;
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    pushNotificationsSpy = TestBed.inject(PushNotifications) as jasmine.SpyObj<PushNotifications>;
    pusherBeamsSpy = TestBed.inject(PusherBeams) as jasmine.SpyObj<PusherBeams>;
    
  });

  describe('hasPermission', () => {
    it('should return true when permission is allowed for Ios', fakeAsync(() => {
      pushNotificationsSpy.requestPermission.and.returnValue(of({
        data: {
          is_last: true,
          task: null
        }
      }));
    }))
  });
  it('should return false when permission is not allowed for Ios', fakeAsync(() => {
    pushNotificationsSpy.requestPermission.and.returnValue(of({
      data: {
        is_last: true,
        task: null
      }
    }));
  }))
});
}); 