import { HttpClient } from '@angular/common/http';
import { TestBed, tick } from '@angular/core/testing';
import { NewRelicService } from '@app/shared/new-relic/new-relic.service';
import { NotificationService } from '@app/shared/notification/notification.service';
import { RequestService } from '@app/shared/request/request.service';
import { TopicService } from '@app/topic/topic.service';
import { BrowserStorageServiceMock } from '@testing/mocked.service';
import { TestUtils } from '@testing/utils';
import { Observable, of } from 'rxjs';
import { SharedService } from './shared.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';
import { PusherService } from '@shared/pusher/pusher.service';

describe('SharedService', () => {
  let service: SharedService;
  let httpSpy: HttpClient;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let storageSpy: BrowserStorageService;
  let utilsSpy: UtilsService;
  let pusherServiceSpy: PusherService;

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
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['achievementPopUp']),
        },
        {
          provide: HttpClient,
          useValue: jasmine.createSpyObj('HttpClient', {
            get: of(true),
          }),
        },
        {
          provide: NewRelicService,
          useValue: jasmine.createSpyObj('NewRelicService', ['noticeError']),
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
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', [
            'post',
            'graphQLWatch',
            'apiResponseFormatError',
            'graphQLFetch',
          ])
        },
      ]
    });
    service = TestBed.inject(SharedService);
    httpSpy = TestBed.inject(HttpClient);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
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
      requestSpy.graphQLFetch.and.returnValue(of({
        data: {
          teams: [
            {
              id: 1,
              uuid: 'f310125a-2a7c-11ec-8d3d-0242ac130003',
              name: 'Team 1',
            },
            {
              id: 2,
              uuid: '13b937b6-2a7d-11ec-8d3d-0242ac130003',
              name: 'Team 2',
            },
            {
              id: 3,
              uuid: '184f5b5c-2a7c-11ec-8d3d-0242ac130003',
              name: 'Team 3',
            },
          ]
        }
      }));

      service.getTeamInfo().subscribe();
      expect(requestSpy.graphQLFetch).toHaveBeenCalled();
    });

    it('should set teamId as null when no teams retrieved from API', () => {
      requestSpy.graphQLFetch.and.returnValue(of({
        data: {
          teams: []
        }
      }));
      utilsSpy.has = jasmine.createSpy('has').and.returnValue(false);

      service.getTeamInfo().subscribe();
      expect(requestSpy.graphQLFetch).toHaveBeenCalled();
      expect(storageSpy.setUser).toHaveBeenCalledWith({
        teamId: null
      });
    });
  });

  describe('onPageLoad()', () => {
    it('should return void if timelineId undefined', () => {
      storageSpy.getUser = jasmine.createSpy('storageSpy.getUser').and.returnValue({
        timelineId: undefined,
      });
      const result = service.onPageLoad();
      expect(httpSpy.get).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should able to change color', () => {
      storageSpy.getUser = jasmine.createSpy('storageSpy.getUser').and.returnValue({
        timelineId: 1,
        colors: {
          theme: '#000000',
        },
        activityCardImage: 'abc'
      });
      const result = service.onPageLoad();
      expect(httpSpy.get).toHaveBeenCalled();
      expect(utilsSpy.changeThemeColor).toHaveBeenCalled();
      expect(utilsSpy.changeCardBackgroundImage).toHaveBeenCalled();
    });
  });
});
