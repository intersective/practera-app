import { Injectable } from '@angular/core';
import { QueryEncoder, RequestService } from 'request';
import { HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { PusherService } from '@v3/services/pusher.service';
import { environment } from '@v3/environments/environment';
import { NotificationsService } from './notifications.service';
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

interface AuthEndpoint {
  data: {
    auth: {
      apikey: string;
      experience: object;
      email?: string;
      unregistered: boolean;
      activationCode?: string;
    }
  }
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
    private notificationsService: NotificationsService,
    private demo: DemoService,
    private apolloService: ApolloService,
  ) { }

  authenticate(data: {
    authToken?: string;
    apikey?: string;
    service?: string;
    // needed when switching program (inform server the latest selected experience)
    experienceUuid?: string;
  }): Observable<AuthEndpoint> {
    const options: {
      variables?: {
        authToken?: string;
        experienceUuid?: string;
      };
      context?: {
        headers?: {
          service?: string;
          apikey?: string;
        };
      };
    } = {};

    // Initialize options.variables
    if (data.authToken || data.experienceUuid) {
      options.variables = {};
    }

    if (data.authToken) {
      options.variables.authToken = data.authToken;
    }

    if (data.experienceUuid) {
      options.variables.experienceUuid = data.experienceUuid;
    }

    // Initialize options.headers
    if (data.apikey || data.service) {
      options.context = { headers: {} };
    }

    if (data.apikey) {
      this.storage.setUser({ apikey: data.apikey });
      options.context.headers.apikey = data.apikey;
    }

    if (data.service) {
      options.context.headers.service = data.service;
    }

    return this.apolloService.graphQLFetch(`
      query auth($authToken: String, $experienceUuid: ID) {
        auth(authToken: $authToken, experienceUuid: $experienceUuid) {
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
          email
          unregistered
          activationCode
        }
      }`,
      options
    ).pipe(
      map((res: AuthEndpoint)=> {
        if (res?.data?.auth?.unregistered === true) {
          // [CORE-6011] trusting API returns email and activationCode
          const { email, activationCode } = res.data.auth;
          throw {
            data: {
              user: {
                email,
                key: activationCode
              },
              message: 'User is not registered'
            },
            status: 'forbidden',
          };
        }
        return res;
      })
    );
  }

  autologin(data: {
    authToken?: string;
    apikey?: string;
    service?: string;
  }): Observable<any> {
    this.logout({}, false);
    return this.authenticate({...data, ...{service: 'LOGIN'}}).pipe(
      map(res => this._handleAuthResponse(res)),
    );
  }

  private _handleAuthResponse(res): {
    apikey?: string;
    experience?: object;
  } {
    const data: {
      apikey: string;
      experience: object;
    } = res.data.auth;

    this.storage.setUser({ apikey: data.apikey });
    this.storage.set('experience', data.experience);
    this.storage.set('isLoggedIn', true);
    return data;
  }

  isAuthenticated(): boolean {
    return this.storage.get('isLoggedIn');
  }

  deprecatingLogin({ email, password }): Observable<any> {
    const body = new HttpParams({
      encoder: new QueryEncoder()
    })
      .set('data[User][email]', email)
      .set('data[User][password]', password)
      .set('domain', this.getDomain());


    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
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
      map(res => this._handleAuthResponse(res)),
    );
  }

  /**
   * Clear user's information and log the user out
   * @param navigationParams the parameters needed when redirect
   * @param redirect         Whether redirect the user to login page or not
   */
  logout(navigationParams = {}, redirect: boolean | string[] = true) {
    // use the config color
    this.utils.changeThemeColor(this.storage.getConfig().colors);
    this.pusherService.unsubscribeChannels();
    this.pusherService.disconnect();
    const config = this.storage.getConfig();


    this.storage.clear();
    if (typeof redirect === 'object') {
      return this.router.navigate(redirect);
    } else if (typeof redirect === 'boolean' && redirect === true) {
      // still store config info even logout
      this.storage.setConfig(config);
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
    })/* comment out until BACKEND is resolved
    .pipe(tap((response) => {
      if (environment.production === false) {
        return;
      }

      if (this.isAuthenticated() && response.data?.length === 0) {
        this.notificationsService.alert({
          header: $localize`It looks like there's a glitch!`,
          message: $localize`We regret to inform you that there appears to be a technical issue preventing your enrollment in any programs at the moment. Please log in again and try once more.`,
          backdropDismiss: false,
          buttons: [
            {
              text: $localize`Login`,
              handler: () => {
                this.logout({}, true);
              },
            }
          ]
        });
        throw new Error('Tech Error: No experience config found!');
      }
    })) */;
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
