import { Component, OnInit, NgZone, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SharedService } from '@v3/services/shared.service';
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
export class AppComponent implements OnInit, OnDestroy {
  title = 'v3';
  customHeader: string | any;

  constructor(
    private platform: Platform,
    private router: Router,
    private sharedService: SharedService,
    private ngZone: NgZone,
    private storage: BrowserStorageService,
    private utils: UtilsService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private versionCheckService: VersionCheckService,
  ) {
    this.customHeader = null;
    this.initializeApp();
  }

  ngOnDestroy(): void {
    this.saveAppState();
  }

  @HostListener('window:beforeunload', ['$event'])
  saveAppState(): void {
    this.storage.lastVisited('url', this.router.url);
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

    const currentLocation = this.utils.getCurrentLocation();
    // @TODO: need to build a new micro service to get the config and serve the custom branding config from a microservice
    // Get the custom branding info and update the theme color if needed
    const domain = currentLocation.hostname;
    this.authService.getConfig({ domain }).subscribe((response: any) => {
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
          if (!logo?.includes('http') && !this.utils.isEmpty(logo)) {
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
    });

    this.magicLinkRedirect(currentLocation);
  }

  magicLinkRedirect(currentLocation): Promise<boolean> {
    let searchParams = null;
    let queryString = '';
    if (currentLocation.search) {
      queryString = currentLocation.search.substring(1);
    } else if (currentLocation.hash) {
      queryString = currentLocation.hash.substring(2);
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
            return this.navigate([
              'auth',
              'secure',
              searchParams.get('auth_token'),
              queries
            ]);
          }
          break;
        case 'resetpassword':
          if (searchParams.has('key') && searchParams.has('email')) {
            return this.navigate([
              'auth',
              'reset_password',
              searchParams.get('key'),
              searchParams.get('email')
            ]);
          }
          break;

        case 'registration':
          if (searchParams.has('key') && searchParams.has('email')) {
            return this.authService.logout({}, [
              'auth',
              'registration',
              searchParams.get('email'),
              searchParams.get('key')
            ]);
          }
          break;
      }
    }

    const lastVisitedUrl = this.storage.lastVisited('url') as string;
    if (lastVisitedUrl) {
      const lastVisitedAssessmentUrl = this.storage.lastVisited('assessmentUrl');
      if (lastVisitedUrl.includes('activity-desktop') && !this.utils.isEmpty(lastVisitedAssessmentUrl)) {
        return this.navigate([lastVisitedAssessmentUrl]);
      }
      return this.navigate([lastVisitedUrl]);
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
}
