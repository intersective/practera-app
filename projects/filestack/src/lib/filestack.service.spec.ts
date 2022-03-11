import { TestBed } from '@angular/core/testing';

import { FilestackService } from './filestack.service';

describe('FilestackService', () => {
  let service: FilestackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilestackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
