import { Injectable } from "@angular/core";
import { RequestService } from "@shared/request/request.service";
import { HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { BrowserStorageService } from "@services/storage.service";
import { UtilsService } from "@services/utils.service";

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  getConfig: "api/v2/plan/experience/config",
  linkedin: "api/auth_linkedin.json",
  login: "api/auths.json",
  setProfile: "api/v2/user/enrolment/edit.json",
  verifyRegistration: "api/verification_codes.json",
  register: "api/registration_details.json"
};

interface verifyParams {
  email: string;
  key: string;
}

interface registerData {
  password: string;
  user_id: string;
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

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private isLoggedIn: boolean = false;

  constructor(
    private request: RequestService,
    private storage: BrowserStorageService,
    private utils: UtilsService
  ) {}

  private _clearCache(): any {
    // do clear user cache here
  }

  private _normaliseAuth(rawData): any {
    var data = rawData.data;

    return {
      success: rawData.success,
      tutorial: data.tutorial,
      apikey: data.apikey,
      programs: data.Timelines.map(function(timeline) {
        return {
          enrolment: timeline.Enrolment,
          program: timeline.Program,
          project: timeline.Project,
          timeline: timeline.Timeline
        };
      }),
      config: (data.Experience || {}).config || {},
      _raw: rawData
    };
  }

  /**
   * @name login
   * @description login API specifically only accept request data in encodedUrl formdata, so must convert them into compatible formdata before submission
   * @param {object} { email, password } in string for each of the value
   */
  login({ email, password }): Observable<any> {
    const body = new HttpParams()
      .set('data[User][email]', email)
      .set('data[User][password]', password);
    return this.request.post(api.login, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).pipe(map(this._handleLoginResponse, this));
  }

  /**
   * @name directLogin
   * @description login API specifically only accept request data in encodedUrl formdata, so must convert them into compatible formdata before submission
   * @param {object} { authToken } in string
   */
  directLogin({ authToken }): Observable<any> {
    const body = new HttpParams()
      .set('auth_token', authToken);
    return this.request.post(api.login, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).pipe(map(this._handleLoginResponse, this));
  }

  private _handleLoginResponse(response) {
    const norm = this._normaliseAuth(response);
    if (response.data) {
      this.storage.set('apikey', norm.apikey);
      this.storage.set('programs', norm.programs);
      this.storage.set('isLoggedIn', true);
    }
    return response;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn || this.storage.get("isLoggedIn");
  }

  logout(): Observable<any> {
    // @TODO: clear ionic view history too
    this.utils.changeThemeColor('#2bbfd4');
    return of(this.storage.clear());
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
    const url = '/api/auth_linkedin.json?apikey=' + this.storage.get('token') + '&appkey=' + this.storage.get('appkey') + '&timeline_id=' + this.storage.getUser().timelineId;
    
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
        const data = response.data;
        this.storage.set('token', data.apikey);
        this.storage.set('tutorial', data.tutorial);
        this.storage.set('programs', data.timelines);
      }

      // @TODO: verify if safari browser localStorage store data above properly
      return response;
    }));
  }

  getConfig(data: ConfigParams): Observable<any> {
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
      throw new Error("Tech Error: Domain is compulsory!");
    }

    return this.getConfig(data);
  }

  updateProfile(data: UserProfile): Observable<any> {
    return this.request.post(api.setProfile, data);
  }

  saveRegistration(data: registerData): Observable<any> {
    return this.request
    .post(api.register, data, {
      headers: { "Content-Type": "application/json" }
    });
  }

  verifyRegistration(data: verifyParams): Observable<any> {
    return this.request
    .post(api.verifyRegistration, data, {
      headers: { "Content-Type": "application/json" }
    });
  }
}
