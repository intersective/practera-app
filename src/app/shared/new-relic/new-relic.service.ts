import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpParameterCodec } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { RequestService } from '@shared/request/request.service';
import { environment } from '@environments/environment';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
// import { noticeError } from 'newrelic';
// import * as newrelic from './../../../../assets/newrelic';
// import 'newrelic';
/*import {
  interaction,
  setErrorHandler,
  setPageViewName,
  addRelease,
} from 'new-relic-browser';*/

import * as NewRelic from 'new-relic-browser';
// import * as NewRelic from 'newrelic';

@Injectable({
  providedIn: 'root',
})

export class NewRelicService {
  private newrelic;
  private interaction;

  constructor(
    private http: HttpClient,
    private request: RequestService,
    private utils: UtilsService,
    private storage: BrowserStorageService
  ) {
    if (newrelic) {
      this.newrelic = newrelic.interaction();
      this.newrelic.onEnd(function() {
        console.log(arguments);
        console.log('interaction ended');
      });
    }

    console.log(this.interaction);
  }

  setPageViewName(name) {
    return newrelic.setPageViewName(name);
  }

  addPageAction(name, customAttr?) {
    return newrelic.addPageAction(name, customAttr);
  }

  setCustomAttribute(name, value) {
    return newrelic.setCustomAttribute(name, value);
  }

  noticeError(error, customAttr?) {
    const { userHash, enrolment } = this.storage.getUser();
    this.setCustomAttribute('enrolment ID', enrolment.id);
    this.setCustomAttribute('user hash', userHash);
    return newrelic.noticeError(error);
  }

  createTracer(name, callback?) {
    const newInteraction = newrelic.interaction();
    return newInteraction.createTracer(name, callback);
  }

  getContext() {
    return this.newrelic.getContext().save();
  }

  actionText(name) {
    return this.newrelic.actionText(name).save();
  }

  setAttribute(name, value) {
    return this.newrelic.setAttribute(name, value).save();
  }
}
