import { HttpClient } from '@angular/common/http';
import { TestBed, tick, fakeAsync } from '@angular/core/testing';
import { NotificationsService } from '@v3/services/notifications.service';
import { RequestService } from 'request';
import { TopicService } from '@v3/services/topic.service';
import { BrowserStorageServiceMock } from '@testingv3/mocked.service';
import { TestUtils } from '@testingv3/utils';
import { Observable, of, throwError } from 'rxjs';
import { SharedService } from './shared.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';
import { PusherService } from './pusher.service';
import { ApolloService } from './apollo.service';

describe('SharedService', () => {
  let service: SharedService;
  let httpSpy: HttpClient;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let storageSpy: BrowserStorageService;
  let utilsSpy: UtilsService;
  let pusherServiceSpy: PusherService;
  let apolloSpy: jasmine.SpyObj<ApolloService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SharedService,
        {
          provide: UtilsService,
          useClass: TestUtils
        },
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock,
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['achievementPopUp']),
        },
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj('HttpClient', {
            get: of(true),
          }),
        },
        {
          provide: TopicService,
          useValue: jasmine.createSpyObj('TopicService', {
            updateTopicProgress: of({
              meta: {
                Achievement: {}
              }
            })
          }),
        },
        {
          provide: PusherService,
          useValue: jasmine.createSpyObj('PusherService', ['initialise']),
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', [
            'graphQLFetch',
            'graphQLWatch',
            'initiateCoreClient',
          ]),
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', [
            'post',
            'apiResponseFormatError',
          ])
        },
      ]
    });
    service = TestBed.inject(SharedService);
    httpSpy = TestBed.inject(HttpClient);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
    storageSpy = TestBed.inject(BrowserStorageService);
    utilsSpy = TestBed.inject(UtilsService);
    pusherServiceSpy = TestBed.inject(PusherService);
    requestSpy.get = jasmine.createSpy('get').and.returnValue(new Observable());
  });

  it('should created', () => {
    expect(service).toBeTruthy();
  });


  describe('getTeamInfo()', () => {
    it('should make GraphQL API request to retrieve team info', () => {
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: {
          user: {
            teams: [
              {
                id: 1,
                name: 'Team 1',
              },
              {
                id: 2,
                name: 'Team 2',
              },
              {
                id: 3,
                name: 'Team 3',
              },
            ]
          }
        }
      }));

      service.getTeamInfo().subscribe();
      expect(apolloSpy.graphQLFetch).toHaveBeenCalled();
    });

    it('should set teamId as null when no teams retrieved from API', fakeAsync(() => {
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: {
          user: {
            teams: []
          }
        }
      }));
      utilsSpy.has = jasmine.createSpy('has').and.returnValue(false);

      service.getTeamInfo().subscribe();
      tick();
      expect(apolloSpy.graphQLFetch).toHaveBeenCalled();
      expect(storageSpy.setUser).toHaveBeenCalledWith({
        teamId: null
      });
    }));

    it('should set teamId as null when wrong response format retrieved from API', fakeAsync(() => {
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: {}
      }));
      utilsSpy.has = jasmine.createSpy('has').and.returnValue(false);

      service.getTeamInfo().subscribe();
      tick();
      expect(apolloSpy.graphQLFetch).toHaveBeenCalled();
      expect(storageSpy.setUser).not.toHaveBeenCalled();
    }));

    it('should just forward response when no "data" object available in the response', fakeAsync(() => {
      const SAMPLE_RESULT = {
        nodata: {}
      };
      apolloSpy.graphQLFetch.and.returnValue(of(SAMPLE_RESULT));

      let result;
      service.getTeamInfo().subscribe(async res => result = await res);
      tick();
      expect(apolloSpy.graphQLFetch).toHaveBeenCalled();
      expect(storageSpy.setUser).not.toHaveBeenCalled();
      expect(result).toEqual(SAMPLE_RESULT);
    }));
  });

  describe('onPageLoad()', () => {
    it('should return void if timelineId undefined', async () => {
      storageSpy.getUser = jasmine.createSpy('storageSpy.getUser').and.returnValue({
        timelineId: undefined,
      });
      const result = await service.onPageLoad();
      expect(httpSpy.get).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should able to change color', async () => {
      storageSpy.getUser = jasmine.createSpy('storageSpy.getUser').and.returnValue({
        timelineId: 1,
        colors: {
          theme: '#000000',
        },
        activityCardImage: 'abc'
      });
      const result = await service.onPageLoad();
      expect(httpSpy.get).toHaveBeenCalled();
      expect(utilsSpy.changeThemeColor).toHaveBeenCalled();
      expect(utilsSpy.changeCardBackgroundImage).toHaveBeenCalled();
    });
  });

  describe('initWebServices()', () => {
    it('should initialise Apollo before awaiting Pusher', async () => {
      const order: string[] = [];
      const pusherSpy = pusherServiceSpy as jasmine.SpyObj<PusherService>;
      apolloSpy.initiateCoreClient.and.callFake(() => {
        order.push('apollo');
        return null;
      });
      pusherSpy.initialise.and.callFake(async () => {
        order.push('pusher');
      });

      await service.initWebServices();

      expect(order).toEqual(['apollo', 'pusher']);
      expect(utilsSpy.checkIsPracteraSupportEmail).toHaveBeenCalled();
    });
  });
});
