import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@v3/services/auth.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { Experience, ExperienceService } from '@v3/services/experience.service';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';

/**
 * Handles ?token=<jwt> login flow.
 * The JWT from core-graphql-api exchangeToken is trusted directly as the apikey.
 * After storing it, a regular authenticate() call fetches the experience data.
 * Deep link parameters are read from route params and handled identically to
 * AuthDirectLoginComponent.
 */
@Component({
  standalone: false,
  selector: 'app-auth-jwt-login',
  template: `
    <ion-content color="light" class="ion-text-center">
      <header>
        <h1 class="for-accessibility" i18n>Logging in</h1>
        <div class="div-logo">
          <app-branding-logo></app-branding-logo>
        </div>
      </header>
      <main aria-label="authentication" aria-live="polite" aria-busy="true">
        <div class="div-after-logo">
          <p role="status" aria-live="polite" i18n>
            We are logging you in, please be patient
            <ion-spinner name="dots" class="vertical-middle" aria-label="Loading" i18n-aria-label role="img"></ion-spinner>
          </p>
        </div>
      </main>
    </ion-content>
  `,
})
export class AuthJwtLoginComponent implements OnInit {
  constructor(
    readonly utils: UtilsService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private experienceService: ExperienceService,
    private storage: BrowserStorageService,
    private ngZone: NgZone,
    private sharedService: SharedService
  ) {}

  async ngOnInit() {
    const jwt = this.route.snapshot.paramMap.get('jwt');
    if (!jwt) {
      return this._error();
    }

    this.authService.logout({}, false);
    this.storage.setUser({ apikey: jwt });

    this.authService.authenticate({ forceRefresh: true }).subscribe({
      next: async (res) => {
        const data = res?.data?.auth;
        if (data) {
          this.storage.setUser({ apikey: data.apikey });
          this.storage.set('experience', data.experience);
          this.storage.set('isLoggedIn', true);
        }
        await this.authService.getMyInfo().toPromise();
        return this._redirect({ experience: data?.experience });
      },
      error: err => {
        console.error('JWT login failed:', err);
        this._error(err);
      }
    });
  }

  private navigate(direction): Promise<boolean> {
    return this.ngZone.run(() => {
      return this.router.navigate(direction);
    });
  }

  private async _redirect(options?: {
    experience?: Experience;
    redirectLater?: boolean;
  }): Promise<boolean | void> {
    const experience = options?.experience;
    const redirectLater = options?.redirectLater || false;

    const redirect = this.route.snapshot.paramMap.get('redirect');
    const activityId = +this.route.snapshot.paramMap.get('act');
    const contextId = +this.route.snapshot.paramMap.get('ctxt');
    const assessmentId = +this.route.snapshot.paramMap.get('asmt');
    const submissionId = +this.route.snapshot.paramMap.get('sm');
    const topicId = +this.route.snapshot.paramMap.get('top');
    const timelineId = +this.route.snapshot.paramMap.get('tl');

    await this.authService.clearCache();

    const redirectConfig = {
      experience,
      save: redirectLater
    };

    if (!redirect || !timelineId) {
      return this._saveOrRedirect(['experiences'], redirectConfig);
    }

    if (this.route.snapshot.paramMap.has('return_url')) {
      this.storage.setUser({
        LtiReturnUrl: this.route.snapshot.paramMap.get('return_url')
      });
    }

    const restrictedAccess = this._singlePageRestriction();

    if (!redirectLater && experience) {
      await this.experienceService.switchProgram({ experience });
    }

    let referrerUrl = '';
    switch (redirect) {
      case 'home':
        return this._saveOrRedirect(['v3', 'home'], redirectConfig);
      case 'project':
        return this._saveOrRedirect(['v3', 'home'], redirectConfig);
      case 'activity':
        if (!activityId) {
          return this._saveOrRedirect(['v3', 'home'], redirectConfig);
        } else if (this.utils.isMobile()) {
          return this._saveOrRedirect(['v3', 'activity-mobile', activityId], redirectConfig);
        }
        return this._saveOrRedirect(['v3', 'activity-desktop', activityId], redirectConfig);
      case 'activity_task':
        if (!activityId) {
          return this._saveOrRedirect(['v3', 'home'], redirectConfig);
        }
        referrerUrl = this.route.snapshot.paramMap.get('activity_task_referrer_url');
        if (referrerUrl) {
          this.storage.setReferrer({ route: 'activity-task', url: referrerUrl });
        }
        if (this.utils.isMobile()) {
          return this._saveOrRedirect(['v3', 'activity-mobile', activityId], redirectConfig);
        }
        return this._saveOrRedirect(['v3', 'activity-desktop', activityId], redirectConfig);
      case 'assessment':
        if (!activityId || !contextId || !assessmentId) {
          return this._saveOrRedirect(['v3', 'home'], redirectConfig);
        }
        referrerUrl = this.route.snapshot.paramMap.get('assessment_referrer_url');
        if (referrerUrl) {
          this.storage.setReferrer({ route: 'assessment', url: referrerUrl });
        }
        if (this.utils.isMobile() || restrictedAccess) {
          if (submissionId) {
            return this._saveOrRedirect(['assessment-mobile', 'assessment', activityId, contextId, assessmentId, submissionId], redirectConfig);
          }
          return this._saveOrRedirect(['assessment-mobile', 'assessment', activityId, contextId, assessmentId], redirectConfig);
        } else {
          return this._saveOrRedirect([
            'v3', 'activity-desktop', activityId,
            { task: 'assessment', contextId, assessmentId }
          ], redirectConfig);
        }
      case 'topic':
        if (!activityId || !topicId) {
          return this._saveOrRedirect(['v3', 'home'], redirectConfig);
        }
        if (this.utils.isMobile() || restrictedAccess) {
          return this._saveOrRedirect(['topic-mobile', activityId, topicId], redirectConfig);
        } else {
          return this._saveOrRedirect(['v3', 'activity-desktop', activityId, { task: 'topic', task_id: topicId }], redirectConfig);
        }
      case 'reviews':
        return this._saveOrRedirect(['v3', 'reviews'], redirectConfig);
      case 'review':
        if (!contextId || !assessmentId || !submissionId) {
          return this._saveOrRedirect(['v3', 'home'], redirectConfig);
        }
        referrerUrl = this.route.snapshot.paramMap.get('assessment_referrer_url');
        if (referrerUrl) {
          this.storage.setReferrer({ route: 'assessment', url: referrerUrl });
        }
        if (this.utils.isMobile() || restrictedAccess === true) {
          return this._saveOrRedirect([
            'assessment-mobile', 'review', contextId, assessmentId, submissionId,
            { from: 'reviews' }
          ], redirectConfig);
        }
        return this._saveOrRedirect(['v3', 'review-desktop', submissionId], redirectConfig);
      case 'chat':
        return this._saveOrRedirect(['v3', 'messages'], redirectConfig);
      case 'settings':
        return this._saveOrRedirect(['v3', 'settings'], redirectConfig);
      default:
        return this._saveOrRedirect(['v3', 'home'], redirectConfig);
    }
  }

  private _saveOrRedirect(route: Array<String | number | object>, options?: {
    save?: boolean;
    experience?: any;
  }): void | Promise<boolean> {
    const currentLocation = window.location.href;
    const locale = options?.experience?.locale;
    if (currentLocation.indexOf('localhost') === -1 && locale && currentLocation.indexOf(locale) === -1) {
      route = [`/${locale}`, ...route];
      return this.utils.redirectToUrl(`${window.location.origin}${route.join('/')}`);
    } else {
      console.info('URL redirection::', {
        dev: route,
        prod: [locale ? `/${locale}` : '', ...route].filter(Boolean)
      });
    }

    if (options?.save === true) {
      return this.storage.set('directLinkRoute', route);
    }
    this.sharedService.initWebServices();
    return this.navigate(route);
  }

  private _error(res?): Promise<any> {
    if (!this.utils.isEmpty(res) && res.status === 'forbidden' && [
      'User is not registered'
    ].includes(res.data?.message)) {
      this._redirect({ redirectLater: true });
      this.storage.set('unRegisteredDirectLink', true);
      return this.navigate(['auth', 'registration', res.data.user.email, res.data.user.key]);
    }

    const errorMessage = res?.message?.includes('User not enrolled')
      ? res.message
      : $localize`Your link is invalid or expired.`;

    return this.notificationsService.alert({
      message: errorMessage,
      buttons: [
        {
          text: $localize`OK`,
          role: 'cancel',
          handler: () => {
            this.authService.logout();
          }
        }
      ]
    });
  }

  private _singlePageRestriction(): boolean {
    const restrictedAccess: string = this.route.snapshot.paramMap.get('one_page_only');
    if (restrictedAccess) {
      this.storage.singlePageAccess = (restrictedAccess === 'true');
    }
    return this.storage.singlePageAccess;
  }
}
