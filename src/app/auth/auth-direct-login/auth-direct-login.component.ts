import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { NotificationService } from '@shared/notification/notification.service';
import { SwitcherService } from '../../switcher/switcher.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

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
    private notificationService: NotificationService,
    private switcherService: SwitcherService,
    private storage: BrowserStorageService,
    private ngZone: NgZone,
    private newRelic: NewRelicService
  ) {}

  async ngOnInit() {
    this.newRelic.setPageViewName('direct-login');
    const authToken = this.route.snapshot.paramMap.get('authToken');
    if (!authToken) {
      return this._error();
    }

    try {
      // skip the authentication if the same auth token has been used before
      if (this.storage.get('authToken') !== authToken) {
        await this.authService.directLogin({ authToken }).toPromise();
        await this.switcherService.getMyInfo().toPromise();
        // save the auth token to compare with future use
        this.storage.set('authToken', authToken);
      }
      this.newRelic.createTracer('Processing direct login');
      return this._redirect();
    } catch (err) {
      console.error(err);
      this._error(err);
    }
  }

  // force every navigation happen under radar of angular
  private navigate(direction): Promise<boolean> {
    return this.ngZone.run(() => {
      this.newRelic.setCustomAttribute('redirection', direction);
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
    this.utils.clearCache();

    if (!redirect || !timelineId) {
      // if there's no redirection or timeline id
      return this._saveOrRedirect(['switcher', 'switcher-program'], redirectLater);
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
        return this._saveOrRedirect(['switcher', 'switcher-program']);
      }
      // switch to the program
      await this.switcherService.switchProgram(program).toPromise();
    }

    switch (redirect) {
      case 'home':
        return this._saveOrRedirect(['app', 'home'], redirectLater);
      case 'project':
        return this._saveOrRedirect(['app', 'home'], redirectLater);
      case 'activity':
        if (!activityId) {
          return this._saveOrRedirect(['app', 'home'], redirectLater);
        }
        return this._saveOrRedirect(['app', 'activity', activityId], redirectLater);
      case 'activity_task':
        if (!activityId) {
          return this._saveOrRedirect(['app', 'home'], redirectLater);
        }
        const referrerUrl = this.route.snapshot.paramMap.get('activity_task_referrer_url');
        if (referrerUrl) {
          // save the referrer url so that we can redirect user later
          this.storage.setReferrer({
            activityTaskUrl: referrerUrl
          });
        }
        return this._saveOrRedirect(['activity-task', activityId], redirectLater);
      case 'assessment':
        if (!activityId || !contextId || !assessmentId) {
          return this._saveOrRedirect(['app', 'home'], redirectLater);
        }
        if (this.utils.isMobile() || restrictedAccess) {
          return this._saveOrRedirect(['assessment', 'assessment', activityId, contextId, assessmentId], redirectLater);
        } else {
          return this._saveOrRedirect(['app', 'activity', activityId, { task: 'assessment', task_id: assessmentId, context_id: contextId }], redirectLater);
        }
      case 'topic':
        if (!activityId || !topicId) {
          return this._saveOrRedirect(['app', 'home'], redirectLater);
        }
        if (this.utils.isMobile() || restrictedAccess) {
          return this._saveOrRedirect(['topic', activityId, topicId], redirectLater);
        } else {
          return this._saveOrRedirect(['app', 'activity', activityId, { task: 'topic', task_id: topicId }], redirectLater);
        }
      case 'reviews':
        return this._saveOrRedirect(['app', 'reviews'], redirectLater);
      case 'review':
        if (!contextId || !assessmentId || !submissionId) {
          return this._saveOrRedirect(['app', 'home'], redirectLater);
        }
        return this._saveOrRedirect(['assessment', 'review', contextId, assessmentId, submissionId], redirectLater);
      case 'chat':
        return this._saveOrRedirect(['app', 'chat'], redirectLater);
      case 'settings':
        return this._saveOrRedirect(['app', 'settings'], redirectLater);
      default:
        return this._saveOrRedirect(['app', 'home'], redirectLater);
    }
  }

  private _saveOrRedirect(route: Array<String | number | object>, save = false) {
    if (save) {
      return this.storage.set('directLinkRoute', route);
    }
    return this.navigate(route);
  }

  private _error(res?): Promise<any> {
    this.newRelic.noticeError('failed direct login', res ? JSON.stringify(res) : undefined);
    if (!this.utils.isEmpty(res) && res.status === 'forbidden' && [
      'User is not registered'
    ].includes(res.data.message)) {
      this._redirect(true);
      this.storage.set('unRegisteredDirectLink', true);
      return this.navigate(['registration', res.data.user.email, res.data.user.key]);
    }
    return this.notificationService.alert({
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

  /**
   * find "one_page_only" parameter in URL to determine user navigation permission in the app
   *
   * @return  {boolean} true = has restriction; false = no restriction
   */
  singlePageRestriction(): boolean {
    // one_page_only: display app limited to one single screen and no other view access are allowed
    const restrictedAccess: string = this.route.snapshot.paramMap.get('one_page_only');

    // extract single page restriction flag from url
    if (restrictedAccess) {
      this.storage.singlePageAccess = (restrictedAccess === 'true') ? true : false;
    }

    return this.storage.singlePageAccess;
  }

  extractStackInfo() {
    const stackUuid: string = this.route.snapshot.paramMap.get('stack_uuid');
    let stack: any;
    if (stackUuid) {
      // @TODO: make request to API endpoint to retrieve stack info
      stack = {
        uuid: 'f4f85069-ca3b-4044-905a-e366b724af6b',
        name: 'Practera App (Local APPV2)',
        description: 'Participate in an experience or coach as a mentor - Local',
        image: 'https://media.intersective.com/img/global-login-practera-black-logo.png',
        url: 'http://127.0.0.1:4200/',
        api: 'http://127.0.0.1:8080/',
        appkey: 'b11e7c189b',
        type: 'app',
        coreApi: 'http://127.0.0.1:8080',
        coreGraphQLApi: 'http://127.0.0.1:8000',
        chatApi: 'http://localhost:3000/local/graphql',
        filestack: {
          s3Config: {
            container: 'practera-aus',
            region: 'ap-southeast-2'
          },
        },
        defaultCountryModel: 'AUS'
      };
    }

    return stack;
  }
}
