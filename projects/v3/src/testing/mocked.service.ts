import { of, Observable } from 'rxjs';
import { SpyObject } from './utils';
import { BrowserStorageService } from '@v3/services/storage.service';
import { Router, NavigationEnd } from '@angular/router';
import { NgZone } from '@angular/core';
import { ProgramFixture } from '@testingv3/fixtures/programs';

export class MockNgZone extends SpyObject {
  run;

  constructor() {
    super(NgZone);
    this.run = this.spy('run').and.returnValue(function(callback) {
      return callback();
    });
  }
}

export class MockRouter extends SpyObject {
  navigate;
  events;
  url;
  createUrlTree;

  constructor() {
    super(Router);
    const TEST_EVENT: Partial<NavigationEnd> = {
      id: 1,
      url: '/test',
      urlAfterRedirects: 'test/test',
    };

    this.navigate = this.spy('navigate');
    this.events = of(new NavigationEnd(
      TEST_EVENT.id,
      TEST_EVENT.url,
      TEST_EVENT.urlAfterRedirects,
    ));
    this.createUrlTree = this.spy('createUrlTree');
    this.url = 'abc';
  }
}

export class FastFeedbackServiceMock {
  pullFastFeedback(): Observable<any> {
    return of({
      present: () => {
        return new Promise<any>(resolve => resolve(true));
      },
      onDidDismiss: (data) => {
        return new Promise<any>(resolve => resolve(data));
      }
    });
  }

  fastFeedbackModal() {
    return true;
  }

  getFastFeedback() {
    return;
  }
}

export class BrowserStorageServiceMock extends SpyObject {
  getUser;
  get;
  getConfig;
  set;
  append;
  remove;
  clear;
  setUser;
  storage;
  setConfig;
  getCountry;
  singlePageAccess;
  setReferrer;
  setCountry;

  constructor() {
    super(BrowserStorageService);
    const USER = {
      userHash: 'testuserhash',
      enrolment: {
        id: 1,
      },
      apikey: 'test',
      timelineId: 'test',
      teamId: 'test',
      contactNumber: '0123456789',
    };
    this.getUser = this.spy('getUser').and.returnValue(USER);
    this.setUser = this.spy('setUser').and.returnValue(true);
    this.setCountry = this.spy('setCountry');
    this.get = this.spy('get').and.returnValue(true);
    this.set = this.spy('set').and.returnValue(true);
    this.remove = this.spy('remove').and.returnValue(true);
    this.getCountry = this.spy('getCountry').and.returnValue('Australia');
    this.getConfig = this.spy('getConfig').and.returnValue({
      logo: '',
    });
    this.singlePageAccess = this.spy('singlePageAccess');
    this.setReferrer = this.spy('setReferrer').and.returnValue(true);
  }

  getProviders(): Array<any> {
    return [{ provide: BrowserStorageService, useValue: this }];
  }
}
