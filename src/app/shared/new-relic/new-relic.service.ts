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

// import * as NewRelic from 'newrelic';
import { environment } from '@environments/environment';

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
    if (!environment.newrelic) {
      return null;
    }
    return newrelic.setPageViewName(name);
  }

  addPageAction(name, customAttr?) {
    if (!environment.newrelic) {
      return null;
    }
    return newrelic.addPageAction(name, customAttr);
  }

  setCustomAttribute(name, value) {
    if (!environment.newrelic) {
      return null;
    }
    return newrelic.setCustomAttribute(name, value);
  }

  noticeError(error, customAttr?) {
    if (!environment.newrelic) {
      return null;
    }
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
    if (!environment.newrelic) {
      return () => ({ });
    }
    const newInteraction = newrelic.interaction();
    return newInteraction.createTracer(name, callback);
  }

  getContext() {
    if (!environment.newrelic) {
      return null;
    }
    return this.newrelic.getContext().save();
  }

  actionText(name) {
    if (!environment.newrelic) {
      return null;
    }
    return this.newrelic.actionText(name).save();
  }

  setAttribute(name, value) {
    if (!environment.newrelic) {
      return null;
    }
    return this.newrelic.setAttribute(name, value).save();
  }
}
