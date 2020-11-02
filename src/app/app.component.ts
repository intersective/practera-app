import { DOCUMENT } from '@angular/common';
import { Component, OnInit, NgZone, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { UtilsService } from '@services/utils.service';
import { SharedService } from '@services/shared.service';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { BrowserStorageService } from '@services/storage.service';
import { NativeStorageService } from '@services/native-storage.service';
import { VersionCheckService } from '@services/version-check.service';
import { environment } from '@environments/environment';
import { PusherService } from '@shared/pusher/pusher.service';
import { PushNotificationService } from '@services/push-notification.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins, AppState, Capacitor } from '@capacitor/core';

const { App, SplashScreen } = Plugins;
import { fromPromise } from 'rxjs/observable/fromPromise';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  hasCustomHeader$: Observable<any>;
  hasCustomHeader: boolean;
  customHeader: string | any;

  constructor(
    private platform: Platform,
    private router: Router,
    public utils: UtilsService,
    private sharedService: SharedService,
    private authService: AuthService,
    private storage: BrowserStorageService,
    private nativeStorage: NativeStorageService,
    private versionCheckService: VersionCheckService,
    private pusherService: PusherService,
    private ngZone: NgZone,
    private newRelic: NewRelicService,
    public sanitizer: DomSanitizer,
    private pushNotificationService: PushNotificationService,
    @Inject(DOCUMENT) private readonly document: Document
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar
  ) {
    this.customHeader = null;
    this.initializeApp();
  }

  // force every navigation happen under radar of angular
  private navigate(direction): Promise<boolean> {
    return this.ngZone.run(() => {
      return this.router.navigate(direction);
    });
  }

  private configVerification(): void {
    const hasOpened = this.storage.get('fastFeedbackOpening');
    if (hasOpened) { // set default modal status
      this.storage.set('fastFeedbackOpening', false);
    }
  }

  ngOnInit() {
    this.configVerification();
    fromPromise(this.sharedService.onPageLoad()).subscribe();

    // @TODO: need to build a new micro service to get the config and serve the custom branding config from a microservice
    // Get the custom branding info and update the theme color if needed
    const domain = this.document.location.hostname;
    this.authService.getConfig({domain}).subscribe(
      async (response: any) => {
        if (response !== null) {
          const expConfig = response.data;
          const numOfConfigs = expConfig.length;
          if (numOfConfigs > 0 && numOfConfigs < 2) {
            let logo = expConfig[0].logo;
            const themeColor = expConfig[0].config.theme_color;
            if (expConfig[0].config.html_branding && expConfig[0].config.html_branding.header) {
              this.customHeader = expConfig[0].config.html_branding.header;
            }
            if (this.customHeader) {
              this.customHeader = this.sanitizer.bypassSecurityTrustHtml(this.customHeader);
            }
            // add the domain if the logo url is not a full url
            if (!logo.includes('http') && !this.utils.isEmpty(logo)) {
              logo = environment.APIEndpoint + logo;
            }
            await this.nativeStorage.setObject('config', {
              'logo': logo,
              'color': themeColor
            });
            // use brand color if no theme color
            const user = await this.nativeStorage.getObject('me');
            if (!this.utils.has(user, 'themeColor') || !user.themeColor) {
              this.utils.changeThemeColor(themeColor);
            }
          }

          this.checkCustom('header').subscribe(hasHeader => {
            this.hasCustomHeader = hasHeader;
          });
        }
      },
      err => {
        this.newRelic.noticeError(`${JSON.stringify(err)}`);
      }
    );

    let searchParams = null;
    let queryString = '';
    if (this.document.location.search) {
      queryString =  this.document.location.search.substring(1);
    } else if (this.document.location.hash) {
      queryString = this.document.location.hash.substring(2);
    }
    searchParams = new URLSearchParams(queryString);

    if (searchParams.has('do')) {
      switch (searchParams.get('do')) {
        case 'secure':
          if (searchParams.has('auth_token')) {
            const queries = this.utils.urlQueryToObject(queryString);
            this.navigate([
              'secure',
              searchParams.get('auth_token'),
              queries
            ]);
          }
          break;
        case 'resetpassword':
          if (searchParams.has('key') && searchParams.has('email')) {
            this.navigate([
              'reset_password',
              searchParams.get('key'),
              searchParams.get('email')
            ]);
          }
          break;

        case 'registration':
          if (searchParams.has('key') && searchParams.has('email')) {
            this.navigate([
              'registration',
              searchParams.get('email'),
              searchParams.get('key')
            ]);
          }
          break;
      }
    }
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      if (environment.production) {
        // watch version update
        this.versionCheckService.initiateVersionCheck();
      }
      // initialise Pusher
      await this.pusherService.initialise();
    });


    if (Capacitor.isNative) {
      App.addListener('appStateChange', (state: AppState) => {
        const pnPermission = this.storage.get('pushnotifications');
        if (!pnPermission) {
          this.pushNotificationService.requestPermission();
        }
        // state.isActive contains the active state
        console.log('App state changed. Is active?', state.isActive);
      });
    }
  }

  /**
   * checking conditions to show custom header
   * @param type header
   */
  checkCustom(type: string): Observable<any> {
    return fromPromise(this.authService.isAuthenticated()).pipe(map(authenticated => {
      return type === 'header' && this.customHeader && authenticated;
    }));
  }

}
