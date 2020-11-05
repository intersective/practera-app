import { TestBed } from '@angular/core/testing';

import { PreferenceResolverService } from './preference-resolver.service';

describe('PreferenceResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreferenceResolverService = TestBed.get(PreferenceResolverService);
    expect(service).toBeTruthy();
  });
});
