import { TestBed } from '@angular/core/testing';
import { TestUtils } from '@testingv3/utils';
import { RequestService } from 'request';
import { ApolloService } from './apollo.service';
import { AuthService } from './auth.service';
import { DemoService } from './demo.service';
import { EventService } from './event.service';

import { ExperienceService } from './experience.service';
import { HomeService } from './home.service';
import { ReviewService } from './review.service';
import { SharedService } from './shared.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';
import { of } from 'rxjs';

describe('ExperienceService', () => {
  let service: ExperienceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DemoService,
          useValue: {},
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['graphQLFetch', 'graphQLMutate', 'graphQLWatch']),
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', {
            getConfig: undefined,
            onPageLoad: undefined,
            getTeamInfo: of({}),
            initWebServices: Promise.resolve(),
          }),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', [
            'get',
            'set',
            'setUser',
            'remove',
            'getUser',
            'getConfig',
          ]),
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post']),
        },
        {
          provide: EventService,
          useValue: jasmine.createSpyObj('EventService', ['trigger', 'listen']),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', ['getReviews']),
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', {
            getTodoItems: undefined,
            clearExperience: of([]),
          }),
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', {
            getConfig: undefined,
            getMyInfo: of({}),
            authenticate: of({}),
            clearCache: Promise.resolve(),
          }),
        },
      ],
    });
    service = TestBed.inject(ExperienceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialise Pusher only after the selected experience is authenticated', async () => {
    const callOrder: string[] = [];
    const sharedService = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    const storageService = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    const experience = {
      id: 2,
      uuid: 'experience-2',
      projectId: 22,
      timelineId: 222,
      featureToggle: {},
    };

    storageService.get.and.returnValue(null);
    authService.authenticate.and.callFake(() => {
      callOrder.push('authenticate');
      return of({
        data: {
          auth: {
            apikey: 'new-api-key',
          },
        },
      } as any);
    });
    sharedService.initWebServices.and.callFake(async () => {
      callOrder.push('pusher');
    });

    await service.switchProgramAndNavigate(experience as any);

    expect(callOrder).toEqual(['authenticate', 'pusher']);
    expect(storageService.setUser).toHaveBeenCalledWith({ apikey: 'new-api-key' });
    expect(sharedService.initWebServices).toHaveBeenCalledTimes(1);
  });

  it('should continue the experience switch when Pusher refresh fails', async () => {
    const sharedService = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    const storageService = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    const consoleError = spyOn(console, 'error');
    const experience = {
      id: 2,
      uuid: 'experience-2',
      projectId: 22,
      timelineId: 222,
      featureToggle: {},
    };

    storageService.get.and.returnValue(null);
    authService.authenticate.and.returnValue(of({
      data: { auth: { apikey: 'new-api-key' } },
    } as any));
    sharedService.initWebServices.and.rejectWith(new Error('Pusher unavailable'));

    const route = await service.switchProgramAndNavigate(experience as any);

    expect(route).toEqual(['v3', 'home']);
    expect(authService.clearCache).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to refresh experience-scoped web services',
      jasmine.any(Error)
    );
  });
});
