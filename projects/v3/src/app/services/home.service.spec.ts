import { TestBed } from '@angular/core/testing';
import { ApolloService } from './apollo.service';

import { HomeService } from './home.service';

describe('HomeService', () => {
  let service: HomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['']),
        }
      ]
    });
    service = TestBed.inject(HomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
