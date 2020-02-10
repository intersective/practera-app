import { FilestackService } from './filestack.service';

describe('FilestackService', () => {
    let service: FilestackService;
    let notificationSpy: jasmine.SpyObj<NotificationService>;
    let storageSpy: jasmine.SpyObj<BrowserStorageService>;
    let eventSpy: jasmine.SpyObj<EventListService>;
    let reviewSpy: jasmine.SpyObj<ReviewListService>;
    let pusherSpy: jasmine.SpyObj<PusherService>;
    let sharedSpy: jasmine.SpyObj<SharedService>;
    let utils: UtilsService;
    const testUtils = new TestUtils();

    beforeEach(() => {
      TestBed.configureTestingModule({
          imports: [ HttpClientTestingModule ],
          providers: [
            FilestackService,
            UtilsService,
            EventListService,
            ReviewListService,
            PusherService,
            SharedService,
            {
              provide: BrowserStorageService,
              useClass: BrowserStorageServiceMock
            },
            {
              provide: RequestService,
              useValue: jasmine.createSpyObj('RequestService', ['post', 'apiResponseFormatError'])
            },
            {
              provide: NotificationService,
              useValue: jasmine.createSpyObj('NotificationService', ['modal'])
            },
          ]
      });
      service = TestBed.get(FilestackService);
      requestSpy = TestBed.get(RequestService);
      utils = TestBed.get(UtilsService);
      notificationSpy = TestBed.get(NotificationService);
      storageSpy = TestBed.get(BrowserStorageService);
      eventSpy = TestBed.get(EventListService);
      reviewSpy = TestBed.get(ReviewListService);
      pusherSpy = TestBed.get(PusherService);
      sharedSpy = TestBed.get(SharedService);

      requestSpy.get = jasmine.createSpy('get').and.returnValue(new Observable());
    });
