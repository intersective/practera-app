import { Injectable, Optional } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpParams } from '@angular/common/http';
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
    if (req.url.includes('ipapi.co')) {
      return next.handle(req);
    }
    const apikey = this.storage.getUser().apikey;
    const timelineId = this.storage.getUser().timelineId;
    const teamId = this.storage.getUser().teamId;
    let headerClone = req.headers;
    const paramsInject = req.params;

    // inject appkey
    if (this.currenConfig.appkey) {
      const appkey = this.currenConfig.appkey;
      headerClone = headerClone.set('appkey', appkey);
    }
    if (apikey) {
      headerClone = headerClone.set('apikey', apikey);
    }
    if (timelineId) {
      headerClone = headerClone.set('timelineId', timelineId);
    }

    // do not need to pass team id for teams.json
    // do not need to pass team id for chat api calls
    if (teamId && !req.url.includes('/teams.json') &&
    !req.url.includes('/message/chat/list.json') && !req.url.includes('/message/chat/create_message') &&
    !req.url.includes('/message/chat/edit_message') && !req.url.includes('/message/chat/list_messages.json')) {
      headerClone = headerClone.set('teamId', teamId);
    }

    return next.handle(req.clone({
      headers: headerClone,
      params: paramsInject,
    }));
  }
}
