import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { Observable, interval, pipe } from 'rxjs';
import { switchMap, concatMap, tap, retryWhen, take, delay } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { BrowserStorageService } from '@services/storage.service';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  LocalNotificationEnabledResult
} from '@capacitor/core';

const { PushNotifications, LocalNotifications, CapacitorPusherBeams } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class PushNotificationService {
  constructor(
    private requestService: RequestService,
    private ngZone: NgZone,
    private storage: BrowserStorageService
  ) {}

    async requestPermission(): Promise<void> {
      // Request permission to use push notifications
      // iOS will prompt user and return if they granted permission or not
      // Android will just grant without prompting
      PushNotifications.requestPermission().then(result => {
        this.storage.set('pushnotifications', result);
        if (result.granted) {
          // Register with Apple / Google to receive push via APNS/FCM
          return PushNotifications.register();
        } else {
          // Show some error
          return;
        }
      });
    }

    registerToServer(): any {
      return PushNotifications.addListener('registration', (token: PushNotificationToken) => {
        console.log('Token:', token.value);
        return token;
      });
    }

    listenToError(): void {
      PushNotifications.addListener('registrationError', (error: any) => {
        console.log('Error on registration: ' + JSON.stringify(error));
      });
    }

    listenToReceiver() {
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });
    }

    listenToActionPerformed() {
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
        }
      );
    }

    /**
     * @name associateDeviceToUser
     * @description link device to current user (we have native plugin code will)
     */
    async associateDeviceToUser(userID, token?) {
      const linkedUser = await CapacitorPusherBeams.setUserID({
        userID,
        headers: {
          appkey: 'b11e7c189b',
          token: token ? token : 'TEST',
        },
        beamsAuthURL: 'http://localhost:3000/beams-auth'
      });
      console.log(linkedUser);
      return linkedUser;
    }

    unsubscribeInterest(interest: string) {
      return CapacitorPusherBeams.removeDeviceInterest(interest);
    }

    /**
     * @description subsribe to single interest (string)
     * @param  {string}        interest
     * @return {Promise<void>}
     */
    subscribeToInterest(interest): Promise<void> {
      return CapacitorPusherBeams.addDeviceInterest({ interest });
    }

    subscribeToInterests(interests: string[] | string): Promise<void> {
      if (typeof interests === 'string') {
        return this.subscribeToInterest(interests);
      }
      return CapacitorPusherBeams.setDeviceInterests(interests);
    }

    clearInterest(): Promise<void> {
      return CapacitorPusherBeams.clearDeviceInterests();
    }

    getSubscribedInterests(): Promise<any> {
      return CapacitorPusherBeams.getDeviceInterests();
    }

    clearPusherBeams() {
      return CapacitorPusherBeams.clearAllState();
    }

    // temporary place this function here (as it's part of the capacitor plugin)
    // ideally, should place at utility service
    goToAppSetting() {
      return CapacitorPusherBeams.goToAppSetting();
    }
}
