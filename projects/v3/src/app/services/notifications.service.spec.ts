import { TestBed } from '@angular/core/testing';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { TestUtils } from '@testingv3/utils';
import { of } from 'rxjs';
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
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser', 'get', 'set']),
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['graphQLFetch']),
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

  describe('markTodoItemAsDone', () => {
    let apolloService: jasmine.SpyObj<ApolloService>;

    beforeEach(() => {
      apolloService = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
      apolloService.graphQLFetch.and.returnValue(of({ data: { updateTodoItem: { success: true } } } as any));
    });

    it('calls apolloService.graphQLMutate with updateTodoItem mutation when identifier provided', () => {
      apolloService.graphQLFetch.and.returnValue(of({ data: {} } as any));
      const mockMutate = jasmine.createSpy('graphQLMutate').and.returnValue(of({}));
      (service as any).apolloService = { ...apolloService, graphQLMutate: mockMutate };

      service.markTodoItemAsDone({ identifier: 'test-identifier' });

      expect(mockMutate).toHaveBeenCalledTimes(1);
      const [mutation, variables] = mockMutate.calls.mostRecent().args;
      expect(mutation).toContain('updateTodoItem');
      expect(variables.identifier).toBe('test-identifier');
      expect(variables.isDone).toBe(true);
    });

    it('calls apolloService.graphQLMutate with id when id provided', () => {
      const mockMutate = jasmine.createSpy('graphQLMutate').and.returnValue(of({}));
      (service as any).apolloService = { ...apolloService, graphQLMutate: mockMutate };

      service.markTodoItemAsDone({ id: 456 });

      expect(mockMutate).toHaveBeenCalledTimes(1);
      const [, variables] = mockMutate.calls.mostRecent().args;
      expect(variables.id).toBe('456');
      expect(variables.isDone).toBe(true);
    });

    it('calls apolloService.graphQLMutate when both identifier and id provided', () => {
      const mockMutate = jasmine.createSpy('graphQLMutate').and.returnValue(of({}));
      (service as any).apolloService = { ...apolloService, graphQLMutate: mockMutate };

      service.markTodoItemAsDone({ identifier: 'test-identifier', id: 456 });

      expect(mockMutate).toHaveBeenCalledTimes(1);
      const [, variables] = mockMutate.calls.mostRecent().args;
      expect(variables.identifier).toBe('test-identifier');
      expect(variables.id).toBe('456');
    });
  });
});
