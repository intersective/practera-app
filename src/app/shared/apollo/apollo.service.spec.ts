import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';

import { ApolloService } from './apollo.service';

describe('ApolloService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ApolloService,
      {
        provide: Apollo,
        useValue: jasmine.createSpyObj('Apollo', [
          'create',
          'getClient',
          'watchQuery',
          'mutate',
          'use',
        ]),
      },
      {
        provide: HttpLink,
        useValue: jasmine.createSpyObj('HttpLink', ['create'])
      }
    ]
  }));

  it('should be created', () => {
    const service: ApolloService = TestBed.inject(ApolloService);
    expect(service).toBeTruthy();
  });
});
