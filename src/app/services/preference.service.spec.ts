import { TestBed } from '@angular/core/testing';

import { PreferenceService } from './preference.service';

describe('PreferenceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreferenceService = TestBed.get(PreferenceService);
    expect(service).toBeTruthy();
  });
});
