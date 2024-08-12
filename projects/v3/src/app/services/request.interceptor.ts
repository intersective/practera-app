import { Injectable, Optional } from '@angular/core';
import { HttpEvent, HttpHeaders, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestConfig } from 'request';
import { BrowserStorageService } from './storage.service';
import { catchError, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';

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
    if (
      req.url.includes('ipapi.co') ||
      req.url.includes('filestackapi.com') ||
      req.url.includes('filestackcontent') ||
      req.url.includes('api.hsforms.com')
    ) {
      return next.handle(req).pipe(catchError(error => {
        if (
          error.url.includes('filestackapi.com') &&
          error.status === 200 &&
          error.statusText === 'OK' &&
          error.name === 'HttpErrorResponse' &&
          error?.error?.text === 'success') {
          return of(error);
        }
        return throwError(error);
      }));
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
    })).pipe(tap(response => {
      if (response instanceof HttpResponse) {
        this._refreshApikey(response);
      }
    }));
  }

  /**
   * Refresh the apikey (JWT token) if API returns it
   */
  private _refreshApikey(response: HttpResponse<any>) {
    const newApikeyFromAPI = response?.body?.data?.auth?.apikey;
    if (newApikeyFromAPI) {
      this.storage.setUser({ apikey: newApikeyFromAPI });
    }
  }
}
