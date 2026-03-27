import { TestBed } from '@angular/core/testing';

import { DueDatesService } from './due-dates.service';

describe('DueDatesService', () => {
  let service: DueDatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DueDatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
