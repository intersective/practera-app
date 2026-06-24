import { TestBed } from '@angular/core/testing';
import { RequestService } from 'request';
import { of } from 'rxjs';

import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let service: NetworkService;
  let requestServiceSpy: jasmine.SpyObj<RequestService>;

  beforeEach(() => {
    requestServiceSpy = jasmine.createSpyObj('RequestService', ['get']);
    requestServiceSpy.get.and.returnValue(of({ status: 200 }));

    TestBed.configureTestingModule({
      providers: [
        NetworkService,
        { provide: RequestService, useValue: requestServiceSpy }
      ]
    });
    service = TestBed.inject(NetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
