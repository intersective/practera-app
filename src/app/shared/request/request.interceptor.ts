import { Injectable, Optional } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { RequestConfig } from './request.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  currenConfig: any;
  constructor(
    @Optional() config: RequestConfig,
  ) {
    this.currenConfig = config;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headerClone = req.headers;
    let paramsInject = req.params;
    let apikey = '';

    // inject appkey
    if (this.currenConfig.appkey) {
      let appkey = this.currenConfig.appkey;
      headerClone = headerClone.set('appkey', appkey);
    }

    return next.handle(req.clone({
      headers: headerClone,
      params: paramsInject,
    }));
  }
}
