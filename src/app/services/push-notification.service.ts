import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { Observable, interval, pipe } from 'rxjs';
import { switchMap, concatMap, tap, retryWhen, take, delay } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { BrowserStorageService } from '@services/storage.service';
import { environment } from '@environments/environment';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  LocalNotificationEnabledResult
} from '@capacitor/core';

const { PushNotifications, LocalNotifications, PusherBeams } = Plugins;

@Injectable({
  providedIn: 'root'
})

export class PushNotificationService {
  constructor(
    private requestService: RequestService,
    private ngZone: NgZone,
    private storage: BrowserStorageService
  ) {}

  async initiatePushNotification(): Promise<void> {
    await this.requestPermission()
    await this.registerToServer();
    await this.listenToError();
    await this.listenToReceiver();
    await this.listenToActionPerformed();
  }

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
        console.log('Unable get permission, prompt user again in future');

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
  async associateDeviceToUser(userID, token) {
    const linkedUser = await PusherBeams.setUserID({
      userID,
      headers: {
        appkey: environment.appkey,
        apikey: token,
      },
      beamsAuthURL: 'https://wchpiwp904.execute-api.us-east-2.amazonaws.com/beams'
    });
    return linkedUser;
  }

  unsubscribeInterest(interest: string) {
    return PusherBeams.removeDeviceInterest(interest);
  }

  /**
   * @description subsribe to single interest (string)
   * @param  {string}        interest
   * @return {Promise<void>}
   */
  subscribeToInterest(interest): Promise<void> {
    return PusherBeams.addDeviceInterest({ interest });
  }

  subscribeToInterests(interests: string[] | string): Promise<void> {
    if (typeof interests === 'string') {
      return this.subscribeToInterest(interests);
    }
    return PusherBeams.setDeviceInterests(interests);
  }

  clearInterest(): Promise<void> {
    return PusherBeams.clearDeviceInterests();
  }

  getSubscribedInterests(): Promise<any> {
    return PusherBeams.getDeviceInterests();
  }

  clearPusherBeams() {
    return PusherBeams.clearAllState();
  }

  // temporary place this function here (as it's part of the capacitor plugin)
  // ideally, should place at utility service
  goToAppSetting() {
    return PusherBeams.goToAppSetting();
  }
}
