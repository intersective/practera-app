import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { UtilsService } from '@services/utils.service';
import { SharedService } from '@services/shared.service';
import { Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { BrowserStorageService } from '@services/storage.service';
import { VersionCheckService } from '@services/version-check.service';
import { environment } from '@environments/environment';
import { PusherService } from '@shared/pusher/pusher.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private router: Router,
    public utils: UtilsService,
    private sharedService: SharedService,
    private authService: AuthService,
    private storage: BrowserStorageService,
    private versionCheckService: VersionCheckService,
    private pusherService: PusherService,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    // do the same thing on every page load
    this.sharedService.onPageLoad();

    // @TODO: need to build a new micro service to get the config and serve the custom branding config from a microservice
    // Get the custom branding info and update the theme color if needed
    const domain = window.location.hostname;
    this.authService.getConfig({domain}).subscribe((response: any) => {
      if (response !== null) {
        const expConfig = response.data;
        const numOfConfigs = expConfig.length;
        if (numOfConfigs > 0 && numOfConfigs < 2) {
          let logo = expConfig[0].logo;
          const themeColor = expConfig[0].config.theme_color;
          // add the domain if the logo url is not a full url
          if (!logo.includes('http') && !this.utils.isEmpty(logo)) {
            logo = environment.APIEndpoint + logo;
          }
          this.storage.setConfig({
            'logo': logo,
            'color': themeColor
          });
          this.utils.changeThemeColor(themeColor);
        }
      }
    });

    let searchParams = null;
    let queryString = '';
    if (window.location.search) {
      queryString =  window.location.search.substring(1);
    } else if (window.location.hash) {
      queryString = window.location.hash.substring(2);
    }
    searchParams = new URLSearchParams(queryString);

    if (searchParams.has('do')) {
      switch (searchParams.get('do')) {
        case 'secure':
          if (searchParams.has('auth_token')) {
            const queries = this.utils.urlQueryToObject(queryString);
            this.router.navigate(['secure', searchParams.get('auth_token'), queries]);
          }
          break;
        case 'resetpassword':
          if (searchParams.has('key') && searchParams.has('email')) {
            this.router.navigate(['reset_password', searchParams.get('key'), searchParams.get('email')]);
          }
          break;

        case 'registration':
          if (searchParams.has('key') && searchParams.has('email')) {
            this.router.navigate(['registration', searchParams.get('email'), searchParams.get('key') ]);
          }
          break;
      }
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // watch version update
      this.versionCheckService.initiateVersionCheck();

      // initialise Pusher
      this.pusherService.initantiate();
    });
  }

}
