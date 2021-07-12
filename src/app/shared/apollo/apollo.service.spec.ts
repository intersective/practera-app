import { TestBed } from '@angular/core/testing';

import { ApolloService } from './apollo.service';

describe('ApolloService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApolloService = TestBed.inject(ApolloService);
    expect(service).toBeTruthy();
  });
});
