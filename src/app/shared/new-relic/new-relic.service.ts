import { Injectable } from '@angular/core';
import { BrowserStorageService } from '@services/storage.service';
// import { noticeError } from 'newrelic';
// import * as newrelic from './../../../../assets/newrelic';
// import 'newrelic';
import {
  interaction,
  setErrorHandler,
  setPageViewName,
  addRelease,
} from 'new-relic-browser';
// import * as newrelic from 'newrelic';

@Injectable({
  providedIn: 'root',
})

export class NewRelicService {
  private newrelic;

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
    console.log(this.storage.getUser());
    const { userHash, enrolment } = this.storage.getUser();
    if (userHash) {
      this.setCustomAttribute('user hash', userHash);
    }
    if (enrolment && enrolment.id) {
      this.setCustomAttribute('enrolment ID', enrolment.id);
    }
    return newrelic.noticeError(error);
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
