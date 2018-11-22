import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';

/**
 * @name api
 * @description list of api endpoint involved in this service
 * @type {Object}
 */
const api = {
  directLink: 'api/auths.json?action=authentication',
  getConfig: 'api/v2/plan/experience/config',
  linkedin: 'api/auth_linkedin.json',
  login: 'api/auth.json',
  me: 'api/users.json',
  setProfile: 'api/v2/user/enrolment/edit.json',
};

interface ConfigParams {
  domain?: string;
  id: number | string;
  apikey: string;
}

interface UserProfile {
  contactNumber: string; 
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedIn: boolean = false;

  constructor(
    private request: RequestService,
    private storage: BrowserStorageService
  ) { }

  private _clearCache():any {
    // do clear user cache here
  }

  /**
   * @name login
   * @description login API specifically only accept request data in encodedUrl formdata, so must conver them into compatible formdata before submission
   * @param {object} { email, password } in string for each of the value
   */
  login({ email, password }): Observable<any> {
  	const body = new HttpParams()
  		.set('data[User][email]', email)
  		.set('data[User][password]', password);

    return this.request.post(api.login, body.toString(), { 
    	headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(map(response => {
      console.log('Auth Response::', response);
      if (response.data) {
        this.storage.set('apikey', response.data.apikey);
        this.storage.set('isLoggedIn', true);
      }
      return response;
    }));
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn || this.storage.get('isLoggedIn');
  }

  /**
   * @name me
   * @description get user info
   */
  me(): Observable<any> {
    return this.request.get(api.me).pipe(map(response => {
      if (response.data) {
        const apiData = response.data;

        this.storage.set('name', apiData.name);
        this.storage.set('contact_number', apiData.contact_number);
        this.storage.set('email', apiData.email);
        this.storage.set('role', apiData.role);
        this.storage.set('image', apiData.image);
        this.storage.set('linkedin_connected', apiData.linkedinConnected);
        this.storage.set('linkedin_url', apiData.linkedin_url);
        this.storage.set('program_id', apiData.program_id);
        this.storage.set('timeline_id', apiData.timeline_id);
        this.storage.set('project_id', apiData.project_id);
        this.storage.set('filestackHash', apiData.userhash);

        // Max points for bubble
        this.storage.set('max_achievable_points', apiData.max_achievable_points);
      }
      return response;
    }));
  }

  logout(): any {
    // @TODO: clear ionic view history too
    return this.storage.clear();
  }

  /**
   * check user linkedIn connection status
   * @return {Boolean}
   */
  linkedinAuthenticated () {
      return this.storage.get('linkedin_connected') || false;
  }

  // Activity ID is no longer used as a parameter,
  // but needs to be there so just pass in a 1
  connectToLinkedIn () {
    /*var url = baseURL + '/api/auth_linkedin.json?activity_id=1&apikey=' + this.storage.set('token') + '&appkey=' + appkey + '&timeline_id=' + this.storage.set('timeline_id');
    Utils.openUrl(url);*/
    return;
  }

  directLink(data): Observable<any> {
    return this.request.post(api.directLink, data).pipe(map(response => {
      if (response.data) {
        const data = response.data;
        this.storage.set('token', data.apikey);
        this.storage.set('tutorial', data.tutorial);
        this.storage.set('timelines', data.timelines);
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
        throw new Error('Tech Error: Domain is compulsory!');
    }

    return this.getConfig(data);
  }

  updateProfile(data: UserProfile): Observable<any> {
    return this.request.post(api.setProfile, data);
  }
}