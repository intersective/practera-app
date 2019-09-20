import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { environment } from '@environments/environment';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
// import { noticeError } from 'new-relic-browser';
// import * as newrelic from './../../../../assets/newrelic';
declare var newrelic: any;

@Injectable({
  providedIn: 'root',
})

export class NewRelicService {
  private newrelic = newrelic.interaction();

  constructor(
    private http: HttpClient,
    private request: RequestService,
    private utils: UtilsService,
    public storage: BrowserStorageService
  ) {
  }

  actionText(name) {
    return this.newrelic.actionText(name);
  }

  setPageViewName(name) {
    return newrelic.setPageViewName(name);
  }

  addPageAction(name, customAttr?) {
    return newrelic.addPageAction(name, customAttr);
  }

  noticeError(error, customAttr?) {
    return newrelic.noticeError(error);
  }
}
