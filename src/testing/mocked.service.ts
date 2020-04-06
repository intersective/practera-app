import { of, Observable } from 'rxjs';
import { SpyObject } from './utils';
import { SwitcherService } from '../app/switcher/switcher.service';
import { BrowserStorageService } from '@services/storage.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { RouterEnter } from '@services/router-enter.service';
import { Router, NavigationEnd } from '@angular/router';
import { NgZone } from '@angular/core';
import { ProgramFixture } from '@testing/fixtures/programs';

export class MockSwitcherService extends SpyObject {
  getPrograms;
  getProgresses;
  switchProgramAndNavigate;
  mockProgresses = [
    {
      id: 1,
      progress: 0.1,
      todoItems: 1
    },
    {
      id: 2,
      progress: 0.2,
      todoItems: 2
    },
    {
      id: 3,
      progress: 0.3,
      todoItems: 3
    }
  ];

  constructor() {
    super(SwitcherService);
    this.getPrograms = this.spy('getPrograms').and.returnValue(of(ProgramFixture));
    this.getProgresses = this.spy('getProgresses').and.returnValue(of(this.mockProgresses));
    this.switchProgramAndNavigate = this.spy('switchProgramAndNavigate');
  }
}

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

  constructor() {
    super(Router);
    const TEST_EVENT: NavigationEnd = {
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
    this.url = 'abc';
  }
}

export class MockRouterEnterService extends SpyObject {
  ngOnInit;
  ngOnDestroy;
  onEnter;
  constructor() {
    super(RouterEnter);
    this.ngOnInit = this.spy('ngOnInit').and.returnValue();
  }
}

export class MockNewRelicService extends SpyObject {
  noticeError;
  actionText;
  createTracer;
  setPageViewName;

  constructor() {
    super(NewRelicService);
    this.createTracer = this.spy('createTracer').and.returnValue(() => true);
    this.noticeError = this.spy('noticeError').and.returnValue(true);
    this.actionText = this.spy('actionText').and.returnValue(true);
    this.setPageViewName = this.spy('setPageViewName').and.returnValue(true);
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
  memoryCache;
  storage;
  setConfig;

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
    this.get = this.spy('get').and.returnValue(true);
    this.getConfig = this.spy('getConfig').and.returnValue({
      logo: '',
    });
  }

  getProviders(): Array<any> {
    return [{ provide: BrowserStorageService, useValue: this }];
  }
}
