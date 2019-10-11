import { of, Observable } from 'rxjs';
import { SpyObject } from './utils';
import { BrowserStorageService } from '@services/storage.service';

export class MockNewRelicService {
  noticeError() {
    return true;
  }
  actionText() {
    return true;
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
      }
    };
    this.getUser = this.spy('getUser').and.returnValue(USER);
    this.get = this.spy('get').and.returnValue(true);
    this.getConfig = this.spy('getConfig').and.returnValue(true);
  }

  getProviders(): Array<any> {
    return [{ provide: BrowserStorageService, useValue: this }];
  }
}
