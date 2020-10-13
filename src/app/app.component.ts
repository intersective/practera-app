import { DOCUMENT } from '@angular/common';
import { Component, OnInit, NgZone, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { UtilsService } from '@services/utils.service';
import { SharedService } from '@services/shared.service';
import { Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { NativeStorageService } from '@services/native-storage.service';
import { VersionCheckService } from '@services/version-check.service';
import { environment } from '@environments/environment';
import { PusherService } from '@shared/pusher/pusher.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  customHeader: string | any;
  constructor(
    private platform: Platform,
    private router: Router,
    public utils: UtilsService,
    private sharedService: SharedService,
    private authService: AuthService,
    private nativeStorage: NativeStorageService,
    private versionCheckService: VersionCheckService,
    private pusherService: PusherService,
    private ngZone: NgZone,
    private newRelic: NewRelicService,
    public sanitizer: DomSanitizer,
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

  private async configVerification(): Promise<void> {
    const hasOpened =  await this.nativeStorage.getObject('fastFeedbackOpening');
    if (hasOpened) { // set default modal status
      this.nativeStorage.setObject('fastFeedbackOpening', false);
    }
  }

  ngOnInit() {
    forkJoin(
      this.configVerification(),
      this.sharedService.onPageLoad(),
    ).subscribe();

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
  }

  /**
   * checking conditions to show custom header
   * @param type header
   */
  checkCustom(type: string): boolean {
    if (type === 'header' && this.customHeader && this.authService.isAuthenticated()) {
      return true;
    }
    return false;
  }

}
