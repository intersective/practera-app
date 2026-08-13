import { TestBed } from '@angular/core/testing';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { TestUtils } from '@testingv3/utils';
import { RequestService } from 'request';
import { AchievementService } from './achievement.service';
import { ApolloService } from './apollo.service';
import { EventService } from './event.service';

import { NotificationsService, TodoItem, api } from './notifications.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';
import { firstValueFrom, of, throwError } from 'rxjs';

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
    let requestService: jasmine.SpyObj<RequestService>;
    let storageService: jasmine.SpyObj<BrowserStorageService>;

    beforeEach(() => {
      requestService = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
      storageService = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    });

    it('should call request.post with correct parameters when identifier is provided', () => {
      const projectId = 123;
      const identifier = 'test-identifier';
      storageService.getUser.and.returnValue({ projectId });

      service.markTodoItemAsDone({ identifier });

      expect(requestService.post).toHaveBeenCalledWith({
        endPoint: api.post.todoItem,
        data: {
          identifier,
          project_id: projectId,
          is_done: true
        }
      });
    });

    it('should call request.post with correct parameters when id is provided', () => {
      const projectId = 123;
      const id = 456;
      storageService.getUser.and.returnValue({ projectId });

      service.markTodoItemAsDone({ id });

      expect(requestService.post).toHaveBeenCalledWith({
        endPoint: api.post.todoItem,
        data: {
          id,
          project_id: projectId,
          is_done: true
        }
      });
    });

    it('should call request.post with correct parameters when both identifier and id are provided', () => {
      const projectId = 123;
      const identifier = 'test-identifier';
      const id = 456;
      storageService.getUser.and.returnValue({ projectId });

      service.markTodoItemAsDone({ identifier, id });

      expect(requestService.post).toHaveBeenCalledWith({
        endPoint: api.post.todoItem,
        data: {
          identifier,
          id,
          project_id: projectId,
          is_done: true
        }
      });
    });

    it('should call requestService.post with correct parameters', () => {
      // arrange
      const projectId = 123;
      storageService.getUser.and.returnValue({ projectId });
      const todoItem: Partial<TodoItem> = {
        identifier: 'test-todo'
      };

      // act
      service.markTodoItemAsDone(todoItem);

      // assert
      expect(requestService.post).toHaveBeenCalledWith({
        endPoint: api.post.todoItem,
        data: {
          ...todoItem,
          project_id: projectId,
          is_done: true
        }
      });
    });
  });

  describe('refreshNotifications', () => {
    let storageService: jasmine.SpyObj<BrowserStorageService>;

    beforeEach(() => {
      storageService = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    });

    it('should clear project-scoped state and load todo items before chat', async () => {
      const notificationEmissions: TodoItem[][] = [];
      const reminderEmissions: any[] = [];
      const callOrder: string[] = [];

      service.notification$.subscribe(items => notificationEmissions.push(items));
      service.eventReminder$.subscribe(reminder => reminderEmissions.push(reminder));
      service.addNewNotification({ id: 1, name: 'Old notification' });
      service['_eventReminder$'].next({ id: 'old-reminder' });
      service['notificationsProjectId'] = 1;
      storageService.getUser.and.returnValue({ projectId: 2 } as any);

      spyOn(service, 'getTodoItems').and.callFake(() => {
        callOrder.push('todo');
        expect(notificationEmissions[notificationEmissions.length - 1]).toEqual([]);
        return of([]);
      });
      spyOn(service, 'getChatMessage').and.callFake(() => {
        callOrder.push('chat');
        return of({});
      });

      await firstValueFrom(service.refreshNotifications());

      expect(callOrder).toEqual(['todo', 'chat']);
      expect(notificationEmissions[notificationEmissions.length - 1]).toEqual([]);
      expect(reminderEmissions[reminderEmissions.length - 1]).toEqual({});
    });

    it('should return the combined todo and chat notification list', async () => {
      const todoItem: TodoItem = { id: 2, type: 'review_submission' };
      const chatItem: TodoItem = { id: 3, type: 'chat' };
      storageService.getUser.and.returnValue({ projectId: 2 } as any);

      spyOn(service, 'getTodoItems').and.callFake(() => {
        service['notifications'] = [todoItem];
        service['_notification$'].next([todoItem]);
        return of([todoItem]);
      });
      spyOn(service, 'getChatMessage').and.callFake(() => {
        service.addNewNotification(chatItem);
        return of(chatItem);
      });

      const result = await firstValueFrom(service.refreshNotifications());

      expect(result).toEqual([todoItem, chatItem]);
    });

    it('should refresh again when the project has not changed', async () => {
      storageService.getUser.and.returnValue({ projectId: 4 } as any);
      const getTodoItemsSpy = spyOn(service, 'getTodoItems').and.returnValue(of([]));
      const getChatMessageSpy = spyOn(service, 'getChatMessage').and.returnValue(of({}));

      await firstValueFrom(service.refreshNotifications());
      await firstValueFrom(service.refreshNotifications());

      expect(getTodoItemsSpy).toHaveBeenCalledTimes(2);
      expect(getChatMessageSpy).toHaveBeenCalledTimes(2);
    });

    it('should leave the new project empty when refresh fails', async () => {
      const notificationEmissions: TodoItem[][] = [];
      service.notification$.subscribe(items => notificationEmissions.push(items));
      service.addNewNotification({ id: 1, name: 'Old notification' });
      service['notificationsProjectId'] = 1;
      storageService.getUser.and.returnValue({ projectId: 2 } as any);
      spyOn(service, 'getTodoItems').and.returnValue(
        throwError(() => new Error('Unable to refresh notifications'))
      );
      spyOn(service, 'getChatMessage');

      await expectAsync(firstValueFrom(service.refreshNotifications())).toBeRejected();

      expect(notificationEmissions[notificationEmissions.length - 1]).toEqual([]);
      expect(service.getChatMessage).not.toHaveBeenCalled();
    });

    it('should discard a partial todo result when the new project chat refresh fails', async () => {
      const notificationEmissions: TodoItem[][] = [];
      const currentTodo: TodoItem = { id: 2, type: 'review_submission' };
      service.notification$.subscribe(items => notificationEmissions.push(items));
      service['notificationsProjectId'] = 1;
      storageService.getUser.and.returnValue({ projectId: 2 } as any);
      spyOn(service, 'getTodoItems').and.callFake(() => {
        service['notifications'] = [currentTodo];
        service['_notification$'].next([currentTodo]);
        return of([currentTodo]);
      });
      spyOn(service, 'getChatMessage').and.returnValue(
        throwError(() => new Error('Unable to refresh chat notifications'))
      );

      await expectAsync(firstValueFrom(service.refreshNotifications())).toBeRejected();

      expect(notificationEmissions[notificationEmissions.length - 1]).toEqual([]);
    });
  });
});
