import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@v3/services/auth.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ExperienceService } from '@v3/services/experience.service';
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

    try {
      // skip the authentication if the same auth token has been used before
      if (this.storage.get('authToken') !== authToken) {
        await this.authService.directLogin({ authToken }).toPromise();
        await this.experienceService.getMyInfo().toPromise();
        // save the auth token to compare with future use
        this.storage.set('authToken', authToken);
      }
      if (environment.demo) {
        setTimeout(() => {
          return this._redirect();
        }, 3000);
      } else {
        return this._redirect();
      }
    } catch (err) {
      console.error(err);
      this._error(err);
    }
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
  private async _redirect(redirectLater?: boolean): Promise<boolean | void> {
    const redirect = this.route.snapshot.paramMap.get('redirect');
    const activityId = +this.route.snapshot.paramMap.get('act');
    const contextId = +this.route.snapshot.paramMap.get('ctxt');
    const assessmentId = +this.route.snapshot.paramMap.get('asmt');
    const submissionId = +this.route.snapshot.paramMap.get('sm');
    const topicId = +this.route.snapshot.paramMap.get('top');
    const timelineId = +this.route.snapshot.paramMap.get('tl');

    // clear the cached data
    await this.utils.clearCache();

    if (!redirect || !timelineId) {
      // if there's no redirection or timeline id
      return this._saveOrRedirect(['experiences'], redirectLater);
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
    if (!redirectLater) {
      const program = this.utils.find(this.storage.get('programs'), value => {
        return value.timeline.id === timelineId;
      });
      if (this.utils.isEmpty(program)) {
        // if the timeline id is not found
        return this._saveOrRedirect(['experiences']);
      }
      // switch to the program
      await this.experienceService.switchProgram(program);
    }

    let referrerUrl = '';
    switch (redirect) {
      case 'home':
        return this._saveOrRedirect(['v3', 'home'], redirectLater);
      case 'project':
        return this._saveOrRedirect(['v3', 'home'], redirectLater);
      case 'activity':
        if (!activityId) {
          return this._saveOrRedirect(['v3', 'home'], redirectLater);
        } else if (this.utils.isMobile()){
          return this._saveOrRedirect(['v3', 'activity-mobile', activityId], redirectLater);
        }
        return this._saveOrRedirect(['v3', 'activity-desktop', activityId], redirectLater);
      case 'activity_task':
        if (!activityId) {
          return this._saveOrRedirect(['v3', 'home'], redirectLater);
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
          return this._saveOrRedirect(['v3', 'activity-mobile', activityId], redirectLater);
        }
        return this._saveOrRedirect(['v3', 'activity-desktop', activityId], redirectLater);
      case 'assessment':
        if (!activityId || !contextId || !assessmentId) {
          return this._saveOrRedirect(['v3', 'home'], redirectLater);
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
            return this._saveOrRedirect(['assessment-mobile', activityId, contextId, assessmentId, submissionId], redirectLater);
          }
          return this._saveOrRedirect(['assessment-mobile', activityId, contextId, assessmentId], redirectLater);
        } else {
          return this._saveOrRedirect(['v3', 'activity-desktop', activityId, { task: 'assessment', task_id: assessmentId, context_id: contextId }], redirectLater);
        }
      case 'topic':
        if (!activityId || !topicId) {
          return this._saveOrRedirect(['v3', 'home'], redirectLater);
        }
        if (this.utils.isMobile() || restrictedAccess) {
          return this._saveOrRedirect(['topic-mobile', activityId, topicId], redirectLater);
        } else {
          return this._saveOrRedirect(['v3', 'activity-desktop', activityId, { task: 'topic', task_id: topicId }], redirectLater);
        }
      case 'reviews':
        return this._saveOrRedirect(['v3', 'reviews'], redirectLater);
      case 'review':
        if (!contextId || !assessmentId || !submissionId) {
          return this._saveOrRedirect(['v3', 'home'], redirectLater);
        }
        referrerUrl = this.route.snapshot.paramMap.get('assessment_referrer_url');
        if (referrerUrl) {
          // save the referrer url so that we can redirect user later
          this.storage.setReferrer({
            route: 'assessment',
            url: referrerUrl
          });
        }
        if (this.utils.isMobile()) {
          return this._saveOrRedirect(['assessment-mobile', 'review', contextId, assessmentId, submissionId, { from: 'reviews' }], redirectLater);
        }
        return this._saveOrRedirect(['v3', 'review-desktop', submissionId], redirectLater);
      case 'chat':
        return this._saveOrRedirect(['v3', 'messages'], redirectLater);
      case 'settings':
        return this._saveOrRedirect(['v3', 'settings'], redirectLater);
      case 'settings-embed':
        return this._saveOrRedirect(['v3', 'settings'], redirectLater); // need to add this route
      default:
        return this._saveOrRedirect(['v3', 'home'], redirectLater);
    }
  }

  private _saveOrRedirect(route: Array<String | number | object>, save = false) {
    if (save) {
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
      this._redirect(true);
      this.storage.set('unRegisteredDirectLink', true);
      return this.navigate(['auth', 'registration', res.data.user.email, res.data.user.key]);
    }
    return this.notificationsService.alert({
      message: 'Your link is invalid or expired.',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            this.navigate(['login']);
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
