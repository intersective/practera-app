import { TestBed } from '@angular/core/testing';
import { TopicService } from './topic.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { NotificationService } from '@shared/notification/notification.service';
import { TestUtils } from '@testing/utils';

fdescribe('TopicService', () => {
  let service: TopicService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let utils: UtilsService;
  const testUtils = new TestUtils();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TopicService,
        UtilsService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['modal'])
        },
      ]
    });
    service = TestBed.get(TopicService);
    requestSpy = TestBed.get(RequestService);
    utils = TestBed.get(UtilsService);
    notificationSpy = TestBed.get(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
