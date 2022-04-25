import { Injectable, Optional } from '@angular/core';
import { HttpEvent, HttpHeaders, HttpInterceptor, HttpHandler, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { RequestConfig } from '@v3/shared/request/request.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  currenConfig: any;
  constructor(
    private storage: BrowserStorageService,
    @Optional() config: RequestConfig,
    private readonly utils: UtilsService,
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
    if (this.currenConfig.appkey) {
      const appkey = this.currenConfig.appkey;
      headers['appkey'] = appkey;
    }
    if (apikey) {
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

    return next.handle(req.clone({
      headers: new HttpHeaders(headers),
      params: paramsInject,
    })).pipe((response) => {
      this._refreshApikey(response);
      return response;
    });
  }

  /**
   * Refresh the apikey (JWT token) if API returns it
   *
   */
  private _refreshApikey(response) {
    if (response && response.apikey) {
      this.storage.setUser({ apikey: response.apikey });
    }
  }
}
