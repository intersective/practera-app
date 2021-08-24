import { Injectable, Optional } from '@angular/core';
import { HttpEvent, HttpHeaders, HttpInterceptor, HttpHandler, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { RequestConfig } from './request.service';
import { BrowserStorageService } from '@services/storage.service';
import { environment } from '@environments/environment';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  currenConfig: any;
  constructor(
    private storage: BrowserStorageService,
    @Optional() config: RequestConfig,
  ) {
    this.currenConfig = config;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('ipapi.co')) {
      return next.handle(req);
    }
    const apikey = this.storage.getUser().apikey;
    const timelineId = this.storage.getUser().timelineId;
    const teamId = this.storage.getUser().teamId;
    const headers = {};
    req.headers.keys().forEach(key => {
      headers[key] = req.headers.get(key);
    });
    const paramsInject = req.params;

    // inject appkey
    if (!this.isLoginAPIURL(req) && this.currenConfig.appkey) {
      const appkey = this.currenConfig.appkey;
      headers['appkey'] = appkey;
    }

    if (apikey && !headers['apikey']) {
      headers['apikey'] = apikey;
    }
    if (timelineId) {
      // header value must be string [ES6]
      headers['timelineId'] = timelineId.toString();
    }

    // do not need to pass team id for teams.json
    // do not need to pass team id for chat api calls
    if (teamId && !req.url.includes('/teams.json') &&
    !req.url.includes('/message/chat/list.json') && !req.url.includes('/message/chat/create_message') &&
    !req.url.includes('/message/chat/edit_message') && !req.url.includes('/message/chat/list_messages.json')) {
      headers['teamId'] = teamId.toString();
    }

    // no need to send apikey in hrader for auth.json.
    // in normal login process we didn't have apikey before login.
    // in direct login/ login with apikey we send apikey in request body.
    if (req.url.includes('/auths.json')) {
      delete headers['apikey'];
    }

    return next.handle(req.clone({
      headers: new HttpHeaders(headers),
      params: paramsInject,
    }));
  }

  /**
   * sometimes we don't need the automated injected headers/params in the
   *
   * @param   {HttpRequest<any>}  req  [req description]
   *
   * @return  {<any>}                  [return description]
   */
  isLoginAPIURL(req: HttpRequest<any>) {
    if (req.url.includes(environment.loginAPIUrl)) {
      return true;
    }
    return false;
  }
}
