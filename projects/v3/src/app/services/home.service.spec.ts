import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApolloService } from './apollo.service';

import { HomeService } from './home.service';

describe('HomeService', () => {
  let service: HomeService;
  let apolloService: jasmine.SpyObj<ApolloService>;

  beforeEach(() => {
    apolloService = jasmine.createSpyObj('ApolloService', ['graphQLWatch']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApolloService,
          useValue: apolloService,
        }
      ]
    });
    service = TestBed.inject(HomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPulseCheckSkills', () => {
    it('should call apolloService.graphQLWatch with the correct query', () => {
      apolloService.graphQLWatch.and.returnValue(of({}));
      service.getPulseCheckSkills().subscribe();
      const expectedQuery = `
        query pulseCheckSkills {
          pulseCheckSkills {
            id
            name
            value
          }
        }
      `;
      expect(apolloService.graphQLWatch).toHaveBeenCalledWith(jasmine.stringMatching(/query pulseCheckSkills/));
    });

    it('should return an observable with pulseCheckSkills data', (done) => {
      const mockResponse = {
        data: {
          pulseCheckSkills: [
            { id: 1, name: 'Skill A', value: 5 },
            { id: 2, name: 'Skill B', value: 3 }
          ]
        }
      };
      apolloService.graphQLWatch.and.returnValue(of(mockResponse));
      service.getPulseCheckSkills().subscribe(res => {
        expect(res).toEqual(mockResponse);
        done();
      });
    });
  });
});
