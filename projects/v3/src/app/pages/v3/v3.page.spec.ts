import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '@v3/services/chat.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { AnimationsService } from '@v3/services/animations.service';
import { ReviewService } from '@v3/services/review.service';
import { of } from 'rxjs';

import { V3Page } from './v3.page';
import { RouterTestingModule } from '@angular/router/testing';
import { UtilsService } from '@v3/app/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HomeService } from '@v3/app/services/home.service';
import { NotificationsService } from '@v3/app/services/notifications.service';

describe('V3Page', () => {
  let component: V3Page;
  let fixture: ComponentFixture<V3Page>;
  let reviewSpy: jasmine.SpyObj<ReviewService>;
  let homeSpy: jasmine.SpyObj<HomeService>;
  let notificationsSpy: jasmine.SpyObj<NotificationsService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let chatSpy: jasmine.SpyObj<ChatService>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ V3Page ],
      imports: [IonicModule.forRoot(), RouterTestingModule, NoopAnimationsModule],
      providers: [
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['create']),
        },
        {
          provide: AnimationsService,
          useValue: jasmine.createSpyObj('AnimationsService', [
            'enterAnimation',
            'leaveAnimation',
          ]),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', ['getReviews'], {
            'reviews$': of(),
          }),
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({}),
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: jasmine.createSpy()
          }),
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', [
            'getChatList',
          ]),
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', ['getExperience'], {
            'experience$': of(),
          }),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['getTodoItems', 'getChatMessage'], {
            'notification$': of(),
          }),
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(V3Page);

    reviewSpy = TestBed.inject(ReviewService) as jasmine.SpyObj<ReviewService>;
    homeSpy = TestBed.inject(HomeService) as jasmine.SpyObj<HomeService>;
    notificationsSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    chatSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;

    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call required methods and set component properties correctly', () => {
    // Prepare data and spies
    const getReviewsSpy = reviewSpy.getReviews;
    const getExperienceSpy = homeSpy.getExperience;
    utilsSpy.moveToNewLocale.and.stub();
    const getTodoItemsSpy = notificationsSpy.getTodoItems.and.returnValue(of());
    const getChatListSpy = chatSpy.getChatList.and.returnValue(of([]));
    storageSpy.getUser.and.returnValue({
      role: 'participant',
      chatEnabled: true,
    });

    // Call ngOnInit
    component.ngOnInit();

    // Check if the required methods are called
    expect(getReviewsSpy).toHaveBeenCalled();
    expect(getExperienceSpy).toHaveBeenCalled();
    expect(getTodoItemsSpy).toHaveBeenCalled();
    expect(getChatListSpy).toHaveBeenCalled();

    // Check if component properties are set correctly
    expect(component.showEvents).toBeTrue();
    expect(component.openMenu).toBeFalse();
    expect(component.showMessages).toBeFalse();
  });
});
