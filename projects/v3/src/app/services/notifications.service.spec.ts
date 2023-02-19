import { TestBed } from '@angular/core/testing';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { TestUtils } from '@testingv3/utils';
import { RequestService } from 'request';
import { AchievementService } from './achievement.service';
import { ApolloService } from './apollo.service';
import { EventService } from './event.service';

import { NotificationsService } from './notifications.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', [
            'dismiss', 'create'
          ]),
        },
        {
          provide: AlertController,
          useValue: jasmine.createSpyObj('AlertController', ['create']),
        },
        {
          provide: ToastController,
          useValue: jasmine.createSpyObj('ToastController', ['create']),
        },
        {
          provide: LoadingController,
          useValue: jasmine.createSpyObj('LoadingController', ['create']),
        },
        {
          provide: AchievementService,
          useValue: jasmine.createSpyObj('AchievementService', ['markAchievementAsSeen']),
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', [
            'get',
            'apiResponseFormatError',
            'post',
          ]),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser']),
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['chatGraphQLQuery']),
        },
        {
          provide: EventService,
          useValue: jasmine.createSpyObj('EventService', ['normaliseEvents']),
        },
      ]
    });
    service = TestBed.inject(NotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing popUpReviewRating()', () => {
    it('should pass the correct data to notification modal', () => {
      service.popUpReviewRating(1, ['home']);
      expect(service.modal).toHaveBeenCalledTimes(1);
      expect(service.modal).toHaveBeenCalledWith({} as any, {
        reviewId: 1,
        redirect: ['home']
      });
    });
  });
});
