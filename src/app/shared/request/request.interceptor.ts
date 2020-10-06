import { Injectable, Optional } from '@angular/core';
import { HttpEvent, HttpHeaders, HttpInterceptor, HttpHandler, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { RequestConfig } from './request.service';
import { BrowserStorageService } from '@services/storage.service';
import { NativeStorageService } from '@services/native-storage.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  currenConfig: any;
  constructor(
    private storage: BrowserStorageService,
    private nativeStorage: NativeStorageService,
    @Optional() config: RequestConfig,
  ) {
    this.currenConfig = config;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('ipapi.co')) {
      return next.handle(req);
    }

    return fromPromise(this.nativeStorage.getObject('user')).pipe(switchMap(user => {
      const apikey = (user && user.apikey) ? user.apikey : this.storage.getUser().apikey;
      const timelineId = (user && user.timelineId) ? user.timelineId : this.storage.getUser().timelineId;
      const teamId = (user && user.teamId) ? user.teamId : this.storage.getUser().teamId;

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
      }));
    }));

    /*
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
    }));*/
  }
}
