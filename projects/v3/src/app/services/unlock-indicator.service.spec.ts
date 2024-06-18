import { TestBed } from '@angular/core/testing';

import { UnlockIndicatorService } from './unlock-indicator.service';

describe('UnlockIndicatorService', () => {
  let service: UnlockIndicatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnlockIndicatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
