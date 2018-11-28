import { inject,fakeAsync, tick, TestBed } from '@angular/core/testing';
import { ActivityService } from './activity.service';
import { of } from 'rxjs';

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
  	TestBed.configureTestingModule({})
    service = TestBed.get(ActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getActivity should be return observable', fakeAsync(() => {
    expect(service.getActivity).toBeTruthy();

    spyOn(service, 'getActivity').and.returnValue(of(service.activity));
    let res = {};
    service.getActivity('activityId').subscribe(_res => {
      res = _res;
    });
    tick();
    expect(res).toEqual(service.activity);
  }));
});
