import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SharedService } from '@v3/services/shared.service';
import { Observable } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '@v3/services/auth.service';
import { VersionCheckService } from '@v3/services/version-check.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'v3';
  customHeader: string | any;

  constructor(
    private platform: Platform,
    private router: Router,
    private sharedService: SharedService,
    private ngZone: NgZone,
    private storage: BrowserStorageService,
    public utils: UtilsService,
    public sanitizer: DomSanitizer,
    private authService: AuthService,
    private versionCheckService: VersionCheckService,
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
    if (this.storage.get('fastFeedbackOpening')) { // set default modal status
      this.storage.set('fastFeedbackOpening', false);
    }
  }

  ngOnInit() {
    this.configVerification();
    this.sharedService.onPageLoad();

    // @TODO: need to build a new micro service to get the config and serve the custom branding config from a microservice
    // Get the custom branding info and update the theme color if needed
    const domain = window.location.hostname;
    this.authService.getConfig({ domain }).subscribe(
      (response: any) => {
        if (response !== null) {
          const expConfig = response.data;
          const numOfConfigs = expConfig.length;
          if (numOfConfigs > 0 && numOfConfigs < 2) {
            let logo = expConfig[0].logo;

            const config = expConfig[0].config || {}; // let it fail gracefully

            if (config.html_branding && config.html_branding.header) {
              this.customHeader = config.html_branding.header;
            }
            if (this.customHeader) {
              this.customHeader = this.sanitizer.bypassSecurityTrustHtml(this.customHeader);
            }

            // add the domain if the logo url is not a full url
            if (!logo.includes('http') && !this.utils.isEmpty(logo)) {
              logo = environment.APIEndpoint + logo;
            }
            const colors = {
              theme: config.theme_color,
            };
            this.storage.setConfig({
              logo,
              colors,
            });

            // use brand color from getConfig API if no cached color available
            // in storage.getUser()
            if (!this.utils.has(this.storage.getUser(), 'colors') || !this.storage.getUser().colors) {
              this.utils.changeThemeColor(colors);
            }
          }
        }
      },
      err => {

      }
    );

    let searchParams = null;
    let queryString = '';
    if (window.location.search) {
      queryString = window.location.search.substring(1);
    } else if (window.location.hash) {
      queryString = window.location.hash.substring(2);
    }
    searchParams = new URLSearchParams(queryString);

    if (searchParams.has('apikey')) {
      const queries = this.utils.urlQueryToObject(queryString);
      return this.navigate(['auth', 'global_login', searchParams.get('apikey'), queries]);
    }

    if (searchParams.has('do')) {
      switch (searchParams.get('do')) {
        case 'secure':
          if (searchParams.has('auth_token')) {
            const queries = this.utils.urlQueryToObject(queryString);
            this.navigate([
              'auth',
              'secure',
              searchParams.get('auth_token'),
              queries
            ]);
          }
          break;
        case 'resetpassword':
          if (searchParams.has('key') && searchParams.has('email')) {
            this.navigate([
              'auth',
              'reset_password',
              searchParams.get('key'),
              searchParams.get('email')
            ]);
          }
          break;

        case 'registration':
          if (searchParams.has('key') && searchParams.has('email')) {
            this.navigate([
              'auth',
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
    this.platform.ready().then(() => {
      if (environment.production) {
        // watch version update
        this.versionCheckService.initiateVersionCheck();
      }
      // initialise Pusher when app loading
      this.sharedService.initWebServices();
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
