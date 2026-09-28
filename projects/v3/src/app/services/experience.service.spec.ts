import { TestBed } from '@angular/core/testing';
import { TestUtils } from '@testingv3/utils';
import { RequestService } from 'request';
import { of } from 'rxjs';
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

describe('ExperienceService', () => {
  let service: ExperienceService;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let sharedSpy: jasmine.SpyObj<SharedService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let homeSpy: jasmine.SpyObj<HomeService>;

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
          useValue: jasmine.createSpyObj('SharedService', ['getConfig', 'getTeamInfo', 'onPageLoad', 'initWebServices']),
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
            'setTabExperience',
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
          useValue: jasmine.createSpyObj('ReviewService', ['getReviews'], { reviews$: of([]) }),
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', ['getTodoItems', 'clearExperience']),
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['getConfig', 'getMyInfo', 'authenticate', 'clearCache']),
        },
      ],
    });
    service = TestBed.inject(ExperienceService);
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    sharedSpy = TestBed.inject(SharedService) as jasmine.SpyObj<SharedService>;
    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    homeSpy = TestBed.inject(HomeService) as jasmine.SpyObj<HomeService>;

    sharedSpy.getTeamInfo.and.returnValue(of({}));
    sharedSpy.onPageLoad.and.returnValue(Promise.resolve());
    sharedSpy.initWebServices.and.returnValue(Promise.resolve());
    authSpy.getMyInfo.and.returnValue(of({ data: { user: {} } }) as any);
    authSpy.clearCache.and.returnValue(Promise.resolve());
    homeSpy.clearExperience.and.returnValue(undefined);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('switchProgram chatEnabled mapping', () => {
    const baseExperience = {
      id: 1,
      uuid: 'exp-uuid',
      name: 'Test Experience',
      color: '#111111',
      secondaryColor: '#222222',
      leadImage: 'lead.png',
      reviewRating: false,
      truncateDescription: true,
    };

    async function expectChatEnabledFor(chatEnable: boolean | undefined, expected: boolean): Promise<void> {
      storageSpy.setUser.calls.reset();
      await service.switchProgram({
        experience: {
          ...baseExperience,
          chatEnable,
        },
      });

      expect(storageSpy.setUser).toHaveBeenCalled();
      const userPayload = storageSpy.setUser.calls.mostRecent().args[0];
      expect(userPayload.chatEnabled).toBe(expected);
    }

    it('should set chatEnabled to false when chatEnable is false', async () => {
      await expectChatEnabledFor(false, false);
    });

    it('should set chatEnabled to true when chatEnable is true', async () => {
      await expectChatEnabledFor(true, true);
    });

    it('should default chatEnabled to true when chatEnable is undefined', async () => {
      await expectChatEnabledFor(undefined, true);
    });
  });

  describe('switchProgramAndNavigate()', () => {
    it('stores the selected experience API key before loading experience data', async () => {
      const callOrder: string[] = [];
      const experience = {
        id: 1,
        uuid: 'exp-uuid',
        name: 'Test Experience',
      };
      authSpy.authenticate.and.callFake(() => {
        callOrder.push('authenticate');
        return of({
          data: {
            auth: {
              apikey: 'scoped-api-key',
              experience,
            },
          },
        } as any);
      });
      sharedSpy.getTeamInfo.and.callFake(() => {
        callOrder.push('getTeamInfo');
        return of({});
      });

      await service.switchProgramAndNavigate(experience as any);

      expect(authSpy.authenticate).toHaveBeenCalledWith({ experienceUuid: experience.uuid });
      expect(storageSpy.setUser.calls.first().args[0]).toEqual({ apikey: 'scoped-api-key' });
      expect(callOrder).toEqual(['authenticate', 'getTeamInfo']);
      expect(authSpy.clearCache).toHaveBeenCalled();
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
});
