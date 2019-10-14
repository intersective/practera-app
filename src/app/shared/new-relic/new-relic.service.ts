import { Injectable } from '@angular/core';
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
    private storage: BrowserStorageService
  ) {
    if (newrelic) {
      this.newrelic = newrelic.interaction();
      this.newrelic.onEnd(function() {
        console.log('interaction ended');
      });
    }
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
    if (userHash) {
      this.setAttribute('user hash', userHash);
    }
    if (enrolment && enrolment.id) {
      this.setAttribute('enrolment ID', enrolment.id);
    }
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
