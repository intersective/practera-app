import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { PusherService } from '@shared/pusher/pusher.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  getConfig: 'api/v2/plan/experience/list',
  login: 'api/auths.json',
  setProfile: 'api/v2/user/enrolment/edit.json',
  verifyRegistration: 'api/verification_codes.json',
  register: 'api/registration_details.json',
  forgotPassword: 'api/auths.json?action=forgot_password',
  verifyResetPassword: 'api/auths.json?action=verify_reset_password',
  resetPassword: 'api/auths.json?action=reset_password',
};

const LOGIN_API = {
  stackInfo: 'https://login.practera.com/stack',
  login: 'login'
};

interface VerifyParams {
  email: string;
  key: string;
}

interface RegisterData {
  password: string;
  user_id: number;
  key: string;
}

interface ConfigParams {
  domain?: string;
  id?: number | string;
  apikey?: string;
}

interface UserProfile {
  contactNumber: string;
}

interface ExperienceConfig {
  name: string;
  config?: {
    theme_color?: string;
    card_style?: string;
    review_rating?: boolean;
    review_rating_notification?: boolean;
    deep_link_in_app?: boolean;
    achievement_in_app_mentor?: boolean;
    achievement_in_app_participant?: boolean;
  };
  logo: string;
}
interface S3Config {
  container: string;
  region: string;
}
interface FilestackConfig {
  s3Config: S3Config;
}
interface StackConfig {
  uuid: string;
  name: string;
  description: string;
  image: string;
  url: string;
  api: string;
  appkey: string;
  type: string;

  coreApi: string;
  coreGraphQLApi: string;
  chatApi: string;

  filestack: FilestackConfig;
  defaultCountryModel: string;
}

interface LoginRequParams {
  username?: string;
  password?: string;
  from?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private request: RequestService,
    private storage: BrowserStorageService,
    private utils: UtilsService,
    private router: Router,
    private pusherService: PusherService
  ) {}

  private _clearCache(): any {
    // do clear user cache here
  }

  /**
   * @name _loginAPILogin
   * @description Calling login API to login the user and save stacks in local storage.
   * @param body Json Object - request parameter need to pass to login api.
   */
  private _loginAPILogin(body: LoginRequParams): Observable<any> {
    body.from = 'App';
    return this.request.post(LOGIN_API.login, body, {}, true)
    .pipe(map(res => {
      this.storage.set('stacks', res.stacks);
      return res;
    }));
  }

  /**
   * @name _login
   * @description Calling core API to login the user.
   * @param body HttpParams Onject - request parameter need to pass to core api.
   * @param serviceHeader header to pass to core API to mention data comming from Login API.
   */
  private _login(body: HttpParams, serviceHeader?: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      service: serviceHeader
     };
    if (!serviceHeader) {
      delete headers.service;
    }
    return this.request.post(api.login, body.toString(), {
      headers
    }).pipe(map(res => this._handleLoginResponse(res)));
  }

  /**
   * @name login
   * @description login API specifically only accept request data in encodedUrl formdata,
   *              so must convert them into compatible formdata before submission
   * @param {object} { email, password } in string for each of the value
   */
  login({ username, password }): Observable<any> {
    const body = {
      username,
      password
    };
    return this._loginAPILogin(body);
  }

  /**
   * @name directLogin
   * @description login API specifically only accept request data in encodedUrl formdata,
   *              so must convert them into compatible formdata before submission
   * @param {object} { authToken } in string
   */
  directLogin({ authToken }): Observable<any> {
    const body = new HttpParams()
      .set('auth_token', authToken);
    this.logout({}, false);
    return this._login(body);
  }

  /**
   * @name directLoginWithApikey
   * @description need to login user to core API if user by using apikey that login API return.
   *              if user came from global login or after user login to login API,
   *              there is apikey login API return, we need to use that to login to core API.
   * @param {object} { apikey, service } in string
   */
  directLoginWithApikey({ apikey, service }): Observable<any> {
    const body = new HttpParams()
      .set('apikey', apikey);
    this.logout({}, false);
    return this._login(body, service);
  }

  private _handleLoginResponse(response): Observable<any> {
    const norm = this._normaliseAuth(response);
    this.storage.setUser({apikey: norm.apikey});
    this.storage.set('programs', norm.programs);
    this.storage.set('isLoggedIn', true);
    return norm;
  }

  private _normaliseAuth(rawData): any {
    const data = rawData.data;
    return {
      success: rawData.success,
      tutorial: data.tutorial,
      apikey: data.apikey,
      programs: data.Timelines.map(
        timeline => {
          // make sure 'Program.config.theme_color' exist
          if (!this.utils.has(timeline, 'Program.config.theme_color')) {
            if (!this.utils.has(timeline.Program, 'config')) {
              timeline.Program.config = {
                theme_color: 'var(--ion-color-primary)'
              };
            } else {
              timeline.Program.config.theme_color = 'var(--ion-color-primary)';
            }
          }
          return {
            enrolment: timeline.Enrolment,
            program: timeline.Program,
            project: timeline.Project,
            timeline: timeline.Timeline,
            experience: timeline.Experience,
          };
        },
        this
      ),
      config: (data.Experience || {}).config || {},
      _raw: rawData
    };
  }

  isAuthenticated(): boolean {
    return this.storage.get('isLoggedIn');
  }

  /**
   * Clear user's information and log the user out
   * @param navigationParams the parameters needed when redirect
   * @param redirect         Whether redirect the user to login page or not
   */
  logout(navigationParams = {}, redirect = true) {
    // use the config color
    this.utils.changeThemeColor(this.storage.getConfig().color || '#2bbfd4');
    this.pusherService.unsubscribeChannels();
    this.pusherService.disconnect();
    const config = this.storage.getConfig();
    this.storage.clear();
    // still store config info even logout
    this.storage.setConfig(config);
    if (redirect) {
      return this.router.navigate(['login'], navigationParams);
    }
  }
   /**
   * @name forgotPassword
   * @description make request to server to send out email with reset password url
   * @param  {string}}        email [user's email which will receive reset password url]
   * @return {Observable<any>}      [description]
   */
  forgotPassword(email: string): Observable<any>  {
    return this.request.post(api.forgotPassword, {
      email: email,
      domain: this.getDomain()
    });
  }

  getDomain() {
    let domain = window.location.hostname;
    domain =
      domain.indexOf('127.0.0.1') !== -1 ||
      domain.indexOf('localhost') !== -1
        ? 'dev.app-v2.practera.com'
        : domain;
    return domain;
  }

  /**
   * @name resetPassword
   * @description make request to server to reset user password
   * @param {[type]} data [description]
   * @return {Observable<any>}      [description]
   */
  resetPassword(data): Observable<any> {
    return this.request.post(api.resetPassword, data);
  }

  /**
   * check user linkedIn connection status
   * @return {Boolean}
   */
  linkedinAuthenticated () {
      return this.storage.getUser().linkedinConnected || false;
  }

  // Activity ID is no longer used as a parameter,
  // but needs to be there so just pass in a 1
  connectToLinkedIn () {
    const url = '/api/auth_linkedin.json?apikey=' + this.storage.getUser().apikey + '&appkey=' + this.storage.get('appkey') + '&timeline_id=' + this.storage.getUser().timelineId;

    this.utils.openUrl(url);
    return;
  }

  /**
   * @name contactNumberLogin
   * @description fast/quick login with contact number
   * @param  {string}}        data [description]
   * @return {Observable<any>}      [description]
   */
  contactNumberLogin(data: { contactNumber: string }): Observable<any> {
    return this.request.post(api.login, {
      contact_number: data.contactNumber, // API accepts contact_numebr
    }).pipe(map(response => {
      if (response.data) {
        this.storage.setUser({apikey: response.data.apikey});
        this.storage.set('tutorial', response.data.tutorial);
        this.storage.set('programs', response.data.timelines);
      }

      // @TODO: verify if safari browser localStorage store data above properly
      return response;
    }));
  }

  getConfig(data: ConfigParams): Observable<{data: ExperienceConfig[]}> {
    return this.request.get(api.getConfig, {
      params: data
    });
  }

  /**
   * @name checkDomain
   * @description enforced domain checking before experience config API call
   * @param {[type]} data [description]
   */
  checkDomain(data): Observable<any> {
    if (!data.domain) {
      throw new Error('Tech Error: Domain is compulsory!');
    }

    return this.getConfig(data);
  }

  updateProfile(data: UserProfile): Observable<any> {
    return this.request.post(api.setProfile, data);
  }

  saveRegistration(data: RegisterData): Observable<any> {
    return this.request
    .post(api.register, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  verifyRegistration(data: VerifyParams): Observable<any> {
    return this.request
    .post(api.verifyRegistration, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * @name verifyResetPassword
   * @description make request to server to verity that user's email and key are valid
   * @param {[type]} data [description]
   * @return {Observable<any>}      [description]
  */
  verifyResetPassword(data: VerifyParams): Observable<any> {
    return this.request
    .post(api.verifyResetPassword, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * @name getUUID
   * @description retrieve user UUID of current requester (user)
   * @return {Observable<string>} UUID in string
   */
  getUUID(): Observable<string> {
    return this.request.graphQLQuery(
      `query user {
        user {
          uuid
        }
      }`
    )
    .pipe(map(res => {
      if (res && res.data) {
        return res.data.user.uuid;
      }
      return null;
    }));
  }

  /**
   * get stack information by uuid through LoginAPI
   *
   * @param   {string<StackConfig>}      uuid
   *
   * @return  {Observable<StackConfig>}        observable response of stack endpont
   */
  getStackConfig(uuid: string): Observable<StackConfig> {
    return this.request.get(LOGIN_API.stackInfo, { uuid }).pipe(map(res => {
      if (res && res.data) {
        return res.data;
      }
      return null;
    }));
  }
}
