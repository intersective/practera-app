import { Injectable, Optional } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { RequestConfig } from './request.service';
import { BrowserStorageService } from '@services/storage.service';

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
    const { apikey, timelineId, teamId } = this.storage.getUser();
    const paramsInject = req.params;

    const headers = {};

    // inherit the existing headers
    const keys = req.headers.keys();
    keys.forEach(key => {
      headers[key] = req.headers.get(key);
    });

    // inject appkey
    if (this.currenConfig.appkey) {
      headers['appkey'] = this.currenConfig.appkey;
    }
    if (apikey) {
      headers['apikey'] = apikey;
    }
    if (timelineId) {
      headers['timelineId'] = timelineId;
    }

    // do not need to pass team id for teams.json
    // do not need to pass team id for chat api calls
    if (teamId && !req.url.includes('/teams.json') &&
    !req.url.includes('/message/chat/list.json') && !req.url.includes('/message/chat/create_message') &&
    !req.url.includes('/message/chat/edit_message') && !req.url.includes('/message/chat/list_messages.json')) {
      headers['teamId'] = teamId;
    }

    const newRequest = req.clone({
      headers: new HttpHeaders(headers),
      params: paramsInject,
    });

    return next.handle(newRequest);
  }
}
