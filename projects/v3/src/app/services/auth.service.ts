import { Injectable } from '@angular/core';
import { QueryEncoder, RequestService } from 'request';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { PusherService } from '@v3/services/pusher.service';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { ApolloService } from './apollo.service';

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
  forgotPassword: 'api/auths.json?action=forgot_password',
  verifyResetPassword: 'api/auths.json?action=verify_reset_password',
  resetPassword: 'api/auths.json?action=reset_password',
  profileImageUpload: 'api/v2/user/account/edit',
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
  contact_number: string;
  email?: string;
  sendsms?: boolean;
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private request: RequestService,
    private storage: BrowserStorageService,
    private utils: UtilsService,
    private router: Router,
    private pusherService: PusherService,
    private demo: DemoService,
    private apolloService: ApolloService,
  ) { }

  authenticate(data: {email: string, password: string}) {
    const { email, password } = data;
    return this.apolloService.graphQLFetch(
      `query getAuth($email: String!, $password: String!) {
        auth(email: $email, password: $password) {
          apikey
          experience {
            id
            uuid
            timelineId
            name
            description
            type
            leadImage
            status
            setupStep
            color
            secondaryColor
            todoItemCount
            role
            isLast
            locale
            supportName
            supportEmail
            cardUrl
            bannerUrl
            logoUrl
            iconUrl
            reviewRating
            truncateDescription
          }
        }
      }`,
      {
        email,
        password
      }
    );
  }

  private _login(body: HttpParams, serviceHeader?: string) {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      service: serviceHeader
    };
    if (!serviceHeader) {
      delete headers.service;
    }
    if (environment.demo) {
      return of({
        programs: []
      });
    }

    return this.request.post({
      endPoint: API.login,
      data: body.toString(),
      httpOptions: {
        headers
      },
      customErrorHandler: (err: any) => {
        return of(err);
      }
    }).pipe(
      map(res => this._handleLoginResponse(res)),
    );
  }

  /**
   * @name login
   * @description login API specifically only accept request data in encodedUrl formdata,
   *              so must convert them into compatible formdata before submission
   * @param {object} { email, password } in string for each of the value
   */
  login({ email, password }): Observable<any> {
    const body = new HttpParams({
      encoder: new QueryEncoder()
    })
      .set('data[User][email]', email)
      .set('data[User][password]', password)
      .set('domain', this.getDomain());

    return this._login(body);
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
   * @name globalLogin
   * @description login API specifically only accept request data in encodedUrl formdata,
   *              so must convert them into compatible formdata before submission
   * @param {object} { apikey } in string
   */
  globalLogin({ apikey, service }): Observable<any> {
    const body = new HttpParams()
      .set('apikey', apikey);
    this.logout({}, false);
    return this._login(body, service);
  }

  private _handleLoginResponse(response): Observable<any> {
    const norm = this._normaliseAuth(response);

    this.storage.setUser({ apikey: norm.apikey });
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
        (timeline): {
          enrolment: any;
          program: any;
          project: any;
          timeline: any;
          experience: any;
          institution: any;
          locale: string;
        } => {
          // make sure 'Program.config.theme_color' exist
          if (!timeline.Program.config?.theme_color) {
            const PRIMARY_COLOR = 'var(--ion-color-primary)';
            if (!timeline.Program?.config) {
              timeline.Program.config = {
                theme_color: PRIMARY_COLOR
              };
            } else {
              timeline.Program.config.theme_color = PRIMARY_COLOR;
            }
          }

          const app_locale = timeline.Institution.config?.application_language;

          return {
            enrolment: timeline.Enrolment,
            program: timeline.Program,
            project: timeline.Project,
            timeline: timeline.Timeline,
            experience: { ...timeline.Experience, lead_image: timeline?.Experience?.lead_url || '' },
            institution: timeline.Institution,
            locale: app_locale || 'en',
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
    this.utils.changeThemeColor(this.storage.getConfig().colors);
    this.pusherService.unsubscribeChannels();
    this.pusherService.disconnect();
    const config = this.storage.getConfig();

    this.storage.clear();
    // still store config info even logout
    this.storage.setConfig(config);

    if (redirect) {
      return this.router.navigate(['/'], navigationParams);
    }
  }

  /**
   * @name forgotPassword
   * @description make request to server to send out email with reset password url
   * @param  {string}}        email [user's email which will receive reset password url]
   * @return {Observable<any>}      [description]
   */
  forgotPassword(email: string): Observable<any> {
    if (environment.demo) {
      return of({});
    }
    return this.request.post({
      endPoint: API.forgotPassword,
      data: {
        email
      }
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
    if (environment.demo) {
      return of({});
    }
    return this.request.post({
      endPoint: API.resetPassword, data
    });
  }

  // Activity ID is no longer used as a parameter,
  // but needs to be there so just pass in a 1
  connectToLinkedIn() {
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
          this.storage.setUser({ apikey: response.data.apikey });
          this.storage.set('tutorial', response.data.tutorial);
          this.storage.set('programs', response.data.timelines);
        }

        // @TODO: verify if safari browser localStorage store data above properly
        return response;
      }));
  }

  getConfig(data: ConfigParams): Observable<{ data: ExperienceConfig[] }> {
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
    if (environment.demo) {
      return of({});
    }
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
    if (environment.demo) {
      return of({});
    }
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
   * @name verifyResetPassword
   * @description make request to server to verity that user's email and key are valid
   * @param {[type]} data [description]
   * @return {Observable<any>}      [description]
  */
  verifyResetPassword(data: VerifyParams): Observable<any> {
    if (environment.demo) {
      return of({});
    }
    return this.request.post({
      endPoint: API.verifyResetPassword,
      data,
      httpOptions: {
        headers: { 'Content-Type': 'application/json' }
      }
    });
  }


  updateProfileImage(data) {
    return this.request.post(
      {
        endPoint: API.profileImageUpload,
        data
      })
      .pipe(map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          return [];
        }
      })
      );
  }
}
