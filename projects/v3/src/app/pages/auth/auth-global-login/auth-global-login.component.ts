import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@v3/services/auth.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ExperienceService } from '@v3/services/experience.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { UtilsService } from '@v3/app/services/utils.service';

@Component({
  selector: 'app-auth-global-login',
  templateUrl: 'auth-global-login.component.html'
})
export class AuthGlobalLoginComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private experienceService: ExperienceService,
    private ngZone: NgZone,
    private utils: UtilsService,
    private readonly storage: BrowserStorageService,
  ) {}

  async ngOnInit() {
    const apikey = this.route.snapshot.paramMap.get('apikey');
    const multipleStacks = this.route.snapshot.paramMap.get('multiple');
    if (!apikey) {
      return this._error();
    }
    try {
      const authed = await this.authService.autologin({ apikey }).toPromise();
      await this.authService.getMyInfo().toPromise();
      await this.experienceService.switchProgram({
        experience: authed.experience
      });

      const homePath = ['v3', 'home'];
      if (multipleStacks) {
        this.storage.set('hasMultipleStacks', true);
      }
      if (environment.demo) {
        return setTimeout(() => {
          return this.navigate(homePath);
        }, 3000);
      } else {
        const currentLocation = window.location.href;
        // check if the current location is localhost
        if (currentLocation.indexOf('localhost') === -1) {
          const locale = authed.experience.locale;
          // if current locale is not in the current location, redirect to the locale
          if (currentLocation.indexOf(locale) === -1) {
            const routeArray = [`/${locale}`, ...homePath];
            const newUrl = `${window.location.origin}${routeArray.join('/')}`;
            return this.utils.redirectToUrl(newUrl);
          }
        } else { // Info: This block is only for development purpose
          const locale = authed.experience.locale;
          /* eslint-disable no-console */
          console.info('URL redirections::', {
            dev: homePath,
            prod: [`/${locale}`, ...homePath],
          });
        }

        return this.navigate(homePath);
      }
    } catch (err) {
      this._error(err);
    }
  }

  // force every navigation happen under radar of angular
  private navigate(direction): Promise<boolean> {
    return this.ngZone.run(() => {
      return this.router.navigate(direction);
    });
  }

  private _error(res?): Promise<any> {

    const errorMessage = res.message.includes('User not enrolled') ? res.message : $localize`Your link is invalid or expired.`;

    return this.notificationsService.alert({
      message: errorMessage,
      buttons: [
        {
          text: $localize`OK`,
          role: 'cancel',
          handler: () => {
            // calling auth service logout mentod to clear user data and redirect
            this.authService.logout();
          }
        }
      ]
    });
  }

}
