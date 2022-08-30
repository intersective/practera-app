import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { TestBed } from '@angular/core/testing';

import { ApolloService } from './apollo.service';
import { RequestService } from 'request';

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
        provide: RequestService,
        useValue: jasmine.createSpyObj('RequestService', [
          'handleError'
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
