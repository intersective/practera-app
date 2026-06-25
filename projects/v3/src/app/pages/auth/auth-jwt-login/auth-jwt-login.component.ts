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
 *
 * Brand continuity: brandColor and brandLogo params (passed by login-app via the
 * redirect URL) are applied immediately so the splash matches the login-app branding
 * while the full institution config loads in the background.
 */
@Component({
  standalone: false,
  selector: 'app-auth-jwt-login',
  template: `
    <ion-content class="jwt-login-content">
      <div class="jwt-login-backdrop" [style.background]="brandColor ? 'linear-gradient(135deg, ' + brandColor + '22 0%, ' + brandColor + '08 100%)' : null"></div>
      <div class="jwt-login-container">
        <div class="jwt-login-card">
          <div class="jwt-login-logo-wrap">
            <img
              *ngIf="brandLogo"
              [src]="brandLogo"
              alt="Organisation logo"
              class="jwt-login-logo"
              (error)="brandLogo = null"
            />
            <app-branding-logo *ngIf="!brandLogo" class="jwt-login-logo-fallback"></app-branding-logo>
          </div>
          <div class="jwt-login-spinner-wrap">
            <div class="jwt-login-ring" [style.border-top-color]="brandColor || null">
              <ion-spinner name="dots" aria-hidden="true"></ion-spinner>
            </div>
          </div>
          <p class="jwt-login-message" role="status" aria-live="polite" i18n>
            Signing you in&hellip;
          </p>
          <div *ngIf="brandLogo" class="jwt-login-powered" aria-hidden="true">
            <span class="jwt-login-powered-text" i18n>Powered by</span>
            <img src="./assets/logo.svg" alt="Practera" class="jwt-login-powered-logo">
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .jwt-login-content {
      --background: #f7f9fc;
    }
    .jwt-login-backdrop {
      position: fixed;
      inset: 0;
      pointer-events: none;
    }
    .jwt-login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .jwt-login-card {
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 4px 32px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06);
      padding: 48px 40px 32px;
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }
    .jwt-login-logo-wrap {
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .jwt-login-logo {
      max-height: 72px;
      max-width: 240px;
      object-fit: contain;
    }
    .jwt-login-logo-fallback {
      max-height: 56px;
      display: block;
    }
    .jwt-login-spinner-wrap {
      margin-bottom: 20px;
    }
    .jwt-login-ring {
      border: 3px solid rgba(0, 0, 0, 0.08);
      border-top-color: var(--ion-color-primary, #2bbfd4);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      animation: jwt-spin 0.8s linear infinite;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .jwt-login-ring ion-spinner {
      display: none;
    }
    @keyframes jwt-spin {
      to { transform: rotate(360deg); }
    }
    .jwt-login-message {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      letter-spacing: 0.01em;
    }
    .jwt-login-powered {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #f0f2f5;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
    }
    .jwt-login-powered-text {
      font-size: 11px;
      color: #b8bfcc;
      letter-spacing: 0.03em;
    }
    .jwt-login-powered-logo {
      height: 14px;
      opacity: 0.4;
    }
  `],
})
export class AuthJwtLoginComponent implements OnInit {
  brandColor: string | null = null;
  brandLogo: string | null = null;

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

    // Decode brand params — double-encoded because urlQueryToObject uses decodeURI
    // (which preserves %23, %2F, etc.) and Angular re-encodes those % signs as %25.
    const _decode = (s: string | null) => { try { return s ? decodeURIComponent(s) : null; } catch { return s; } };
    const rawColor = _decode(this.route.snapshot.paramMap.get('brandColor'));
    const rawLogo = _decode(this.route.snapshot.paramMap.get('brandLogo'));

    // Clear existing session — storage.clear() is called inside logout({}, false).
    // Brand params are stored AFTER this clear so they are not wiped.
    this.authService.logout({}, false);
    this.storage.setUser({ apikey: jwt });

    // Apply and persist brand params now that storage has been cleared and re-seeded.
    // Storing brandColor in both config (survives page refresh) and user.colors
    // (prevents AppComponent.getConfig() from overwriting via its changeThemeColor guard).
    if (rawColor && /^#[0-9A-Fa-f]{6}$/.test(rawColor)) {
      this.brandColor = rawColor;
      this.utils.changeThemeColor({ primary: rawColor });
      this.storage.setConfig({ brandColor: rawColor });
      this.storage.setUser({ colors: { primary: rawColor } });
    }
    if (rawLogo) {
      this.brandLogo = rawLogo;
      // Only persist the logo when it's an absolute URL. A relative path (e.g.
      // /img/logo.svg from login.practera.local) would 404 on app.practera.local.
      if (rawLogo.startsWith('http')) {
        this.storage.setConfig({ logo: rawLogo });
      }
    }

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
    const isLocalDev = currentLocation.indexOf('localhost') !== -1 || currentLocation.indexOf('.local') !== -1;
    if (!isLocalDev && locale && currentLocation.indexOf(locale) === -1) {
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
