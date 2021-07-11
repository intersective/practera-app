import { TestBed } from '@angular/core/testing';

import { SwitcherResolverService } from './switcher-resolver.service';

describe('SwitcherResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SwitcherResolverService = TestBed.get(SwitcherResolverService);
    expect(service).toBeTruthy();
  });
});
