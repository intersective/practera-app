import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NewRelicService } from '@app/shared/new-relic/new-relic.service';
import { NotificationService } from '@app/shared/notification/notification.service';
import { RequestService } from '@app/shared/request/request.service';
import { TopicService } from '@app/topic/topic.service';
import { BrowserStorageServiceMock } from '@testing/mocked.service';
import { TestUtils } from '@testing/utils';
import { of } from 'rxjs';
import { SharedService } from './shared.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';

describe('SharedService', () => {
  let service: SharedService;
  let httpSpy: HttpClient;
  let storageSpy: BrowserStorageService;
  let utilsSpy: UtilsService;

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
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['post']),
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
      ]
    });
    service = TestBed.inject(SharedService);
    httpSpy = TestBed.inject(HttpClient);
    storageSpy = TestBed.inject(BrowserStorageService);
    utilsSpy = TestBed.inject(UtilsService);
  });

  it('should created', () => {
    expect(service).toBeTruthy();
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
