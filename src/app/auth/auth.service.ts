import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
import { HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { BrowserStorageService, Stack } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { PusherService } from '@shared/pusher/pusher.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const API = {
  getConfig: 'api/v2/plan/experience/list',
  login: 'api/auths.json',
  setProfile: 'api/v2/user/enrolment/edit.json',
  verifyRegistration: 'api/verification_codes.json',
  register: 'api/registration_details.json',
};

const LOGIN_API = {
  stackInfo: 'stack',
  multipleStacks: 'stacks',
  login: 'login',
  forgotPassword: 'forgotPassword',
  resetPassword: 'user'
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
   * @name _loginFromLoginAPI
   * @description Calling login API to login the user and save stacks in local storage.
   * @param body Json Object - request parameter need to pass to login api.
   */
  private _loginFromLoginAPI(body: LoginRequParams): Observable<any> {
    body.from = 'App';
    return this.request.post(
      {
        endPoint: LOGIN_API.login,
        data: body,
        isLoginAPI: true
      });
  }

  /**
   * @name _loginFromCore
   * @description Calling core API to login the user.
   * @param body HttpParams Onject - request parameter need to pass to core api.
   * @param serviceHeader header to pass to core API to mention data comming from Login API.
   */
  private _loginFromCore(body: HttpParams, serviceHeader?: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      service: serviceHeader
     };
    if (!serviceHeader) {
      delete headers.service;
    }
    return this.request.post(
      {
        endPoint: API.login,
        data: body.toString(),
        httpOptions: {
          headers
        }
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
    return this._loginFromLoginAPI(body);
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
    return this._loginFromCore(body);
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
    const cachedStack = this.storage.stackConfig;
    this.logout({}, false);
    this.storage.stackConfig = cachedStack;
    return this._loginFromCore(body, service);
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
    const body = {
      email,
      resetLink: this._createLinks('reset'),
      directLink: this._createLinks('direct')
    };
    return this.request.post(
      {
        endPoint: LOGIN_API.forgotPassword,
        data: body,
        isLoginAPI: true
      });
  }

  /**
   * method will create direct and rest links need for forget password.
   * for reset password, follow the same format all the appv2 links follows.
   *  *.com?do=resetpassword&apikey=
   * for direct link, follow the format of link that use to redirect users from global login app to appv2.
   * with this can use same auth global login component to login in user to stack my apikey.
   *  *.com?service=LOGIN&apikey=
   * @param type string - 'direct' to create direct link or 'reset' for password reset link
   * @returns string
   */
  private _createLinks(type?) {
    switch (type) {
      case 'reset':
        return `${this.getDomain()}?do=resetpassword&apikey=`;
      case 'direct':
        return `${this.getDomain()}?service=LOGIN&apikey=`;
    }
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
  resetPassword(data: { password: string }, header: { apikey: string } ): Observable<any> {
    return this.request.put(LOGIN_API.resetPassword, data, { headers: header}, true);
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
    return this.request.post(
      {
        endPoint: API.login,
        data: {
          contact_number: data.contactNumber,
        }
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
    return this.request.get(API.getConfig, {
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
    return this.request.post(
      {
        endPoint: API.setProfile,
        data
      }
    );
  }

  saveRegistration(data: RegisterData): Observable<any> {
    return this.request.post(
      {
        endPoint: API.register,
        data,
        httpOptions: {
          headers: { 'Content-Type': 'application/json' }
        }
      });
  }

  verifyRegistration(data: VerifyParams): Observable<any> {
    return this.request.post(
      {
        endPoint: API.verifyRegistration,
        data,
        httpOptions: {
          headers: { 'Content-Type': 'application/json' }
        }
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
   * according postman and swagger file need to pass uuid as query param
   * also need to call login API.
   * @param   {string}      uuid
   * @return  {Observable<Stack>}        observable response of stack endpont
   */
  getStackConfig(uuid: string): Observable<Stack> {
    return this.request.get(LOGIN_API.stackInfo, {params: {uuid}}, true).pipe(map(res => {
      if (res) {
        return res;
      }
      return null;
    }));
  }

  /**
   * get multiple stacks from endpoint
   * Purpose: allow user to switching from one stack to another stack
   *
   * @return  {Observable<Stack>[]} multiple stacks
   */
  getStacks(): Observable<Stack[]> {
    return this.request.get(LOGIN_API.multipleStacks, {
      params: {
        type: 'app'
      }
    },                      true).pipe(
      map(res => {
        if (res) {
          this.storage.stacks = res;
          return res;
        }
        return [];
      })
    );
  }
}
