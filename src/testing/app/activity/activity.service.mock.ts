import { SpyObject } from '../../utils';
import { ActivityService } from '../../../app/activity.service';

export class MockActivityService extends SpyObject {
  tasks;
  fakeResponse;
  getOverview;

  constructor() {
    super(ActivityService);
    this.getOverviewSpy = this.spy('getOverview').and.returnValue(this);
    this.fakeResponse = null;
  }

  subscribe(callback) {
    callback(this.fakeResponse);
  }

  setResponse(json: any): void {
    this.fakeResponse = json;
  }

  getProviders(): Array<any> {
    return [{
      provide: ActivityService, useValue: this
    }];
  }
}
