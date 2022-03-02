import { Injectable } from '@angular/core';
import { BrowserStorageService } from '@services/storage.service';
declare var newrelic: any;

import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})

export class NewRelicService {
  private newrelic;
  private interaction; // newrelic browser interaction

  constructor(
    private storage: BrowserStorageService
  ) {
    if (!this.newrelic) {
      this.newrelic = newrelic;
      this.interaction = this.newrelic.interaction();
      this.interaction.onEnd(function () {
        console.log('interaction ended');
      });
    }
  }

  setPageViewName(name) {
    if (!environment.newrelic) {
      return null;
    }
    return this.newrelic.setPageViewName(name);
  }

  addPageAction(name, customAttr?) {
    if (!environment.newrelic) {
      return null;
    }
    return this.newrelic.addPageAction(name, customAttr);
  }

  setCustomAttribute(name, value) {
    if (!environment.newrelic) {
      return null;
    }
    return this.newrelic.setCustomAttribute(name, value);
  }

  noticeError(error, customAttr?) {
    if (!environment.newrelic) {
      return null;
    }

    const { userHash, enrolment } = this.storage.getUser();
    if (userHash) {
      this.setCustomAttribute('user hash', userHash);
    }
    if (enrolment && enrolment.id) {
      this.setCustomAttribute('enrolment ID', enrolment.id);
    }

    return this.newrelic.noticeError(error);
  }

  createTracer(name, callback?) {
    if (!environment.newrelic) {
      return () => ({});
    }
    const newInteraction = this.newrelic.interaction();
    return newInteraction.createTracer(name, callback);
  }

  getContext() {
    if (!environment.newrelic) {
      return null;
    }
    return this.interaction.getContext().save();
  }

  actionText(name) {
    if (!environment.newrelic) {
      return null;
    }
    return this.interaction.actionText(name).save();
  }

  setAttribute(name, value) {
    if (!environment.newrelic) {
      return null;
    }
    return this.interaction.setAttribute(name, value).save();
  }
}
