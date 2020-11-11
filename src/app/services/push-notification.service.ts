import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
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
  LocalNotificationEnabledResult,
  PermissionsOptions,
  PermissionType,
  Capacitor,
  NotificationPermissionResponse
} from '@capacitor/core';

const { PushNotifications, LocalNotifications, PusherBeams, Permissions } = Plugins;
const { Notifications } = PermissionType;

export enum PermissionTypes {
  firstVisit = 'isFirstVisit',
}

@Injectable({
  providedIn: 'root'
})

export class PushNotificationService {
  constructor(
    private storage: BrowserStorageService
  ) {
    const hasPlugin = Capacitor.isPluginAvailable('PushNotifications');
    if (!hasPlugin) {
      PushNotifications.requestPermission = (): Promise<NotificationPermissionResponse> => {
        return new Promise(resolve => {
          return resolve({ granted: false });
        });
      };

      PushNotifications.register = (): Promise<void> => new Promise(resolve => resolve());
      // PushNotifications.addListener =>
      console.log('no plugins?');
    }
  }

  async initiatePushNotification(): Promise<void> {
    await this.requestPermission();
    await this.registerToServer();
    await this.listenToError();
    await this.listenToReceiver();
    await this.listenToActionPerformed();
  }

  /**
   * check Push Notification permission is allowed
   * @return {Promise<boolean>} true = allowed, false = no permission granted
   */
  async hasPermission(): Promise<boolean> {
    const getPermission = await Permissions.query({ name: Notifications });
    const result = await PushNotifications.requestPermission();
    if (result.granted === true && getPermission.state === 'granted') {
      return true;
    }

    return false;
  }

  async requestPermission(): Promise<void> {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    const result = await PushNotifications.requestPermission();
    this.storage.set('pushnotifications', result);
    if (result.granted) {
      // Register with Apple / Google to receive push via APNS/FCM
      return PushNotifications.register();
    } else {
      // Show some error
      console.log('Unable get permission, prompt user again in future');
      return;
    }
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
    return PusherBeams.setDeviceInterests({ interests });
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

  private _visitedCache(): string[] {
    const cache = this.storage.get('visited');
    const visited = Array.isArray(cache) ? cache : [];
    return visited;
  }

  /**
   * @name promptForPermission
   * @description check push notification permission by comparing visited page
   *              & permission granted on device
   * @param  {PermissionTypes}     type     Capacitor plugins's Permissions types
   * @param  {RouterStateSnapshot} snapshot Router's state snapshot
   * @return {Promise<boolean>}
   *         true = request for permission (show popup)
   *         false = do not request for permission (do notshow popup)
   */
  async promptForPermission(type: PermissionTypes, snapshot: RouterStateSnapshot): Promise<boolean> {
    const pluginAvailable = Capacitor.isPluginAvailable('PushNotifications');
    // skip immediately if plugin N/A (especially on browser)
    if (!pluginAvailable) {
      return false;
    }

    let result = false;
    const visited = this._visitedCache();
    switch (type) {
      case PermissionTypes.firstVisit:
        const hasPermission = await this.hasPermission();
        if (!visited.includes(snapshot.url) && !hasPermission) {
          result = true;
        }
        break;
    }

    this.recordVisit(snapshot);
    return result;
  }

  /**
   * required to prompt user for allowing permission for Push notification
   * this function would only store unique visit, duplicates get filtered out.
   */
  recordVisit(snapshot: RouterStateSnapshot): void {
    const visited = this._visitedCache();
    const newVisits = Array.from(new Set(visited.concat(snapshot.url)));
    this.storage.set('visited', newVisits);
    return;
  }

  // temporary place this function here (as it's part of the capacitor plugin)
  // ideally, should place at utility service
  goToAppSetting() {
    return PusherBeams.goToAppSetting();
  }
}
