import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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
          'createDefault',
          'getClient',
          'watchQuery',
          'query',
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

  describe('initiateCoreClient()', () => {
    it('should not throw when apollo client is not yet defined', () => {
      const service: ApolloService = TestBed.inject(ApolloService);
      const apollo: any = TestBed.inject(Apollo);
      // mock client getter to throw (as real Apollo does before initialization)
      apollo.client = undefined;
      Object.defineProperty(apollo, 'client', {
        get: () => { throw new Error('Client has not been defined yet'); },
        configurable: true,
      });
      // add createDefault as a simple spy since defineProperty may interfere with the original spy
      apollo.createDefault = jasmine.createSpy('createDefault');
      expect(() => service.initiateCoreClient()).not.toThrow();
      expect(apollo.createDefault).toHaveBeenCalled();
    });
  });

  describe('graphQLFetch()', () => {
    it('initializes the core client before querying', () => {
      const service: ApolloService = TestBed.inject(ApolloService);
      const apollo: any = TestBed.inject(Apollo);
      apollo.createDefault = jasmine.createSpy('createDefault');
      apollo.query.and.returnValue(of({ data: {} }));

      service.graphQLFetch('query test { test }').subscribe();

      expect(apollo.createDefault).toHaveBeenCalled();
      expect(apollo.query).toHaveBeenCalled();
    });
  });
});
