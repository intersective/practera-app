import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@v3/services/auth.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { Experience, ExperienceService } from '@v3/services/experience.service';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { SharedService } from '@v3/services/shared.service';
import { environment } from '@v3/environments/environment';

@Component({
  selector: 'app-auth-direct-login',
  templateUrl: 'auth-direct-login.component.html',
})
export class AuthDirectLoginComponent implements OnInit {
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
    const authToken = this.route.snapshot.paramMap.get('authToken');
    if (!authToken) {
      return this._error();
    }

    this.authService.autologin({ authToken }).subscribe({
      next: async (authed) => {
        await this.experienceService.getMyInfo().toPromise();
        return this._redirect({ experience: authed.experience });
      },
      error: err => {
        console.error(err);
        this._error(err);
      }
    });
  }

  // force every navigation happen under radar of angular
  private navigate(direction): Promise<boolean> {
    return this.ngZone.run(() => {
      return this.router.navigate(direction);
    });
  }

  /**
   * Redirect user to a specific page if data is passed in, otherwise redirect to program switcher page
   *
   * @param {boolean}   redirectLater
   * @returns {Promise<boolean | void>}
   */
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

    // clear the cached data
    await this.authService.clearCache();

    const redirectConfig = {
      experience,
      save: redirectLater
    };

    if (!redirect || !timelineId) {
      // if there's no redirection or timeline id
      return this._saveOrRedirect(['experiences'], redirectConfig);
    }

    // purpose of return_url
    // - when user switch program, he/she will be redirect to this url
    if (this.route.snapshot.paramMap.has('return_url')) {
      this.storage.setUser({
        LtiReturnUrl: this.route.snapshot.paramMap.get('return_url')
      });
    }

    const restrictedAccess = this.singlePageRestriction();

    // switch program directly if user already registered
    if (!redirectLater && experience) {
      await this.experienceService.switchProgram({
        experience
      });
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
        } else if (this.utils.isMobile()){
          return this._saveOrRedirect(['v3', 'activity-mobile', activityId], redirectConfig);
        }
        return this._saveOrRedirect(['v3', 'activity-desktop', activityId], redirectConfig);
      case 'activity_task':
        if (!activityId) {
          return this._saveOrRedirect(['v3', 'home'], redirectConfig);
        }
        referrerUrl = this.route.snapshot.paramMap.get('activity_task_referrer_url');
        if (referrerUrl) {
          // save the referrer url so that we can redirect user later
          this.storage.setReferrer({
            route: 'activity-task',
            url: referrerUrl
          });
        }
        if (this.utils.isMobile()){
          return this._saveOrRedirect(['v3', 'activity-mobile', activityId], redirectConfig);
        }
        return this._saveOrRedirect(['v3', 'activity-desktop', activityId], redirectConfig);
      case 'assessment':
        if (!activityId || !contextId || !assessmentId) {
          return this._saveOrRedirect(['v3', 'home'], redirectConfig);
        }

        referrerUrl = this.route.snapshot.paramMap.get('assessment_referrer_url');
        if (referrerUrl) {
          // save the referrer url so that we can redirect user later
          this.storage.setReferrer({
            route: 'assessment',
            url: referrerUrl
          });
        }

        if (this.utils.isMobile() || restrictedAccess) {
          if (submissionId) {
            return this._saveOrRedirect(['assessment-mobile', 'assessment', activityId, contextId, assessmentId, submissionId], redirectConfig);
          }
          return this._saveOrRedirect(['assessment-mobile', 'assessment', activityId, contextId, assessmentId], redirectConfig);
        } else {
          return this._saveOrRedirect([
            'v3', 'activity-desktop',
            activityId,
            {
              task: 'assessment',
              contextId,
              assessmentId,
            }
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
          // save the referrer url so that we can redirect user later
          this.storage.setReferrer({
            route: 'assessment',
            url: referrerUrl
          });
        }

        if (this.utils.isMobile() || restrictedAccess === true) {
          return this._saveOrRedirect([
            'assessment-mobile',
            'review',
            contextId,
            assessmentId,
            submissionId,
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
    if (currentLocation.indexOf('localhost') === -1 && currentLocation.indexOf(locale) === -1) {
      route = [`/${locale}`, ...route];
      this.utils.redirectToUrl(`${window.location.origin}${route.join('/')}`);
    } else { // Info: This block is only for development purpose
      console.info('URL redirection::', {
        dev: route,
        prod: [`/${locale || null}`, ...route]
      });
    }

    if (options?.save) {
      return this.storage.set('directLinkRoute', route);
    }
    /**
    * Initialise Pusher.
    *
    * When user use deep link to login to app. user not going through switcher service.
    * So pusher initialise not calling after user login using using deep link.
    */
    this.sharedService.initWebServices();
    return this.navigate(route);
  }

  private _error(res?): Promise<any> {
    if (!this.utils.isEmpty(res) && res.status === 'forbidden' && [
      'User is not registered'
    ].includes(res.data.message)) {
      this._redirect({ redirectLater: true });
      this.storage.set('unRegisteredDirectLink', true);
      return this.navigate(['auth', 'registration', res.data.user.email, res.data.user.key]);
    }

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

  singlePageRestriction(): boolean {
    // one_page_only: display app limited to one single screen and no other view access are allowed
    const restrictedAccess: string = this.route.snapshot.paramMap.get('one_page_only');

    // extract single page restriction flag from url
    if (restrictedAccess) {
      this.storage.singlePageAccess = (restrictedAccess === 'true') ? true : false;
    }

    return this.storage.singlePageAccess;
  }


}
