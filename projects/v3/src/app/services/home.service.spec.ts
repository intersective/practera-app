import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApolloService } from './apollo.service';
import { HomeService } from './home.service';
import { NotificationsService } from './notifications.service';
import { AuthService } from './auth.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';
import { DemoService } from './demo.service';
import { TestUtils } from '@testingv3/utils';

describe('HomeService', () => {
  let service: HomeService;
  let apolloService: jasmine.SpyObj<ApolloService>;

  beforeEach(() => {
    apolloService = jasmine.createSpyObj('ApolloService', ['graphQLWatch', 'graphQLFetch']);
    TestBed.configureTestingModule({
      providers: [
        HomeService,
        {
          provide: ApolloService,
          useValue: apolloService,
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['presentToast', 'alert', 'modal'])
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['getConfig'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser', 'get', 'set'])
        },
        {
          provide: UtilsService,
          useClass: TestUtils
        },
        {
          provide: DemoService,
          useValue: jasmine.createSpyObj('DemoService', ['normalResponse'])
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
        success: true,
        status: 'success',
        cache: false,
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
