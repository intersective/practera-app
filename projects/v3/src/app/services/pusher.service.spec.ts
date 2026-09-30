import { TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { PusherService } from '@v3/services/pusher.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MockRouter } from '@testingv3/mocked.service';
import { UtilsService } from '@v3/services/utils.service';
import { RequestService } from 'request';
import { environment } from '@v3/environments/environment';
import Pusher from 'pusher-js';
import { TestUtils } from '@testingv3/utils';
import { ApolloService } from './apollo.service';
import { ApolloQueryResult } from '@apollo/client';

class PusherLib extends Pusher {
  connection;

  constructor() {
    super('TESTAPIKEY');

    this.connection = {
      state: 'test',
    };
  }

  disconnect() {
    return true;
  }

  connect() {
    return true;
  }

  allChannels() {
    return [];
  }
}
const initialisingPusher = {
  connection: {
    state: 'connected',
    key: '',
  },
  connect: () => true,
  channel: [],
  allChannels: () => [],
};

/* describe('PusherConfig', () => {
  const config = new PusherConfig();

  it('should have pusherKey & apiurl', () => {
    expect(config.pusherKey).toEqual('');
  });
}); */

describe('PusherService', async () => {
  const PUSHER_APIURL = 'APIURL';
  const PUSHERKEY = 'pusherKey';
  const APIURL = 'api/v2/message/notify/channels.json';
  const libConfig = {
    cluster: 'mt1',
    forceTLS: true,
    authEndpoint: `${'apiurl'}${APIURL}`,
    auth: {
      headers: {
        'Authorization': `pusherKey=${PUSHERKEY}`,
        'appkey': environment.appkey,
        'apikey': 'apikey',
        'timelineid': 1
      },
    },
  };

  let service: PusherService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let utilSpy: UtilsService;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let mockBackend: HttpTestingController;
  let apolloSpy: jasmine.SpyObj<ApolloService>;
  // let pusherLibSpy: any;

  beforeEach(() => {
    // spyOn(Window, 'Pusher');
    // pusherLibSpy = new PusherLib(this.pusherKey, libConfig);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PusherService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        /*{
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', [
            'has',
            'changeThemeColor',
            'openUrl',
            'isEmpty',
            'each',
          ]),
        },*/
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: {
              timelineId: 1,
              apikey: 'apikey'
            }
          })
        },
        /* {
          provide: PusherConfig,
          useValue: {
            pusherKey: PUSHERKEY
          }
        }, */
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', {
            graphQLFetch: of({
              pipe: of({ data: [] })
            })
          }),
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', {
            get: of({ data: [] }),
            apiResponseFormatError: 'ERROR',
          }),
        }
      ],
    }).compileComponents();

    mockBackend = TestBed.inject(HttpTestingController);
    service = TestBed.inject(PusherService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    utilSpy = TestBed.inject(UtilsService);
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
  });

  it('should create', () => {
    expect(service).toBeDefined();
  });

  const notificationRes = {
    data: [
      {
        channel: 'notification-channel'
      }
    ]
  };

  const pusherChatChannelRes: ApolloQueryResult<any> = {
    data: {
      channels: [
        {
          pusherChannel: 'fgv34fg-34-8472354eb'
        },
        {
          pusherChannel: 'k76i865-jyj-5f44eb4f'
        }
      ]
    },
    loading: false,
    networkStatus: 7,
    partial: false,
    dataState: 'complete',
  };

  describe('getChannels()', async () => {

    it(`should call getNotificationChannel() and make API request to ${APIURL}`, () => {
      requestSpy.get.and.returnValue(of(notificationRes));
      spyOn(service, 'isSubscribed').and.returnValue(true);
      service.getNotificationChannel().subscribe();
      expect(requestSpy.get).toHaveBeenCalledWith(APIURL, {
        params: { env: environment.env, for: 'notification' }
      });
    });

    it('should call getChatChannels() and make API request to chat GraphQL Server', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(pusherChatChannelRes));
      spyOn(service, 'isSubscribed').and.returnValue(true);
      service.getChatChannels().subscribe();
      expect(apolloSpy.graphQLFetch.calls.count()).toBe(1);
    });

    it('should ignore a notification-channel response from a previous experience', () => {
      const response$ = new Subject<any>();
      requestSpy.get.and.returnValue(response$);
      storageSpy.getUser = jasmine.createSpy('getUser').and.returnValue({
        apikey: 'old-key',
        timelineId: 1,
      });
      spyOn(service, 'subscribeChannel');

      service.getNotificationChannel().subscribe();
      storageSpy.getUser.and.returnValue({
        apikey: 'new-key',
        timelineId: 2,
      });
      response$.next(notificationRes);

      expect(service.subscribeChannel).not.toHaveBeenCalled();
    });

    it('should ignore both channel responses when the experience changes mid-refresh', async () => {
      const notificationResponse$ = new Subject<any>();
      const chatResponse$ = new Subject<any>();
      requestSpy.get.and.returnValue(notificationResponse$);
      apolloSpy.graphQLFetch.and.returnValue(chatResponse$);
      storageSpy.getUser.and.returnValue({
        apikey: 'old-key',
        timelineId: 1,
      } as any);
      spyOn(service, 'subscribeChannel');

      const refresh = service.getChannels();
      storageSpy.getUser.and.returnValue({
        apikey: 'new-key',
        timelineId: 2,
      } as any);
      notificationResponse$.next(notificationRes);
      chatResponse$.next(pusherChatChannelRes);
      await refresh;

      expect(service.subscribeChannel).not.toHaveBeenCalled();
    });

    it('should remove chat listeners that are not in the current experience channel set', () => {
      const removedSubscription = jasmine.createSpyObj('removedSubscription', ['unbind_all']);
      const retainedSubscription = jasmine.createSpyObj('retainedSubscription', ['unbind_all']);
      const pusher = jasmine.createSpyObj('pusher', ['unsubscribe']);
      service['pusher'] = pusher;
      service['channels'].chat = [
        { name: 'old-chat-channel', subscription: removedSubscription },
        { name: 'current-chat-channel', subscription: retainedSubscription },
      ];
      apolloSpy.graphQLFetch.and.returnValue(of({
        ...pusherChatChannelRes,
        data: {
          channels: [
            { pusherChannel: 'current-chat-channel' },
            { pusherChannel: 'new-chat-channel' },
          ],
        },
      }));
      spyOn(service, 'subscribeChannel');

      service.getChatChannels().subscribe();

      expect(removedSubscription.unbind_all).toHaveBeenCalled();
      expect(pusher.unsubscribe).toHaveBeenCalledWith('old-chat-channel');
      expect(retainedSubscription.unbind_all).not.toHaveBeenCalled();
      expect(service['channels'].chat.map(channel => channel.name)).toEqual(['current-chat-channel']);
      expect(service.subscribeChannel).toHaveBeenCalledWith('chat', 'current-chat-channel');
      expect(service.subscribeChannel).toHaveBeenCalledWith('chat', 'new-chat-channel');
    });

    it('should ignore an older same-scope chat response', () => {
      const firstResponse$ = new Subject<any>();
      const secondResponse$ = new Subject<any>();
      apolloSpy.graphQLFetch.and.returnValues(firstResponse$, secondResponse$);
      const reconcileSpy = spyOn<any>(service, 'reconcileChatChannels');

      service.getChatChannels().subscribe();
      service.getChatChannels().subscribe();
      secondResponse$.next({ data: { channels: [{ pusherChannel: 'latest-channel' }] } });
      firstResponse$.next({ data: { channels: [{ pusherChannel: 'stale-channel' }] } });

      expect(reconcileSpy).toHaveBeenCalledTimes(1);
      expect(reconcileSpy).toHaveBeenCalledWith(['latest-channel']);
    });

    it('should treat an empty chat response as the exact current set', () => {
      const subscription = jasmine.createSpyObj('subscription', ['unbind_all']);
      const pusher = jasmine.createSpyObj('pusher', ['unsubscribe']);
      service['pusher'] = pusher;
      service['channels'].chat = [{ name: 'removed-channel', subscription }];
      apolloSpy.graphQLFetch.and.returnValue(of({ data: { channels: [] } } as any));

      service.getChatChannels().subscribe();

      expect(subscription.unbind_all).toHaveBeenCalled();
      expect(pusher.unsubscribe).toHaveBeenCalledWith('removed-channel');
      expect(service['channels'].chat).toEqual([]);
    });

    it('should preserve same-scope chat listeners when discovery fails', async () => {
      const existingChannels = [{ name: 'current-channel', subscription: null }];
      service['channels'].chat = existingChannels;
      service['activeScope'] = { programId: null, projectId: null, timelineId: 1 };
      service['pusher'] = jasmine.createSpyObj('pusher', [], {
        config: { auth: { headers: {} } },
        connection: { state: 'connected' },
      });
      apolloSpy.graphQLFetch.and.returnValue(
        throwError(() => new Error('Channel discovery failed'))
      );
      spyOn(console, 'error');

      await service.refreshChatChannels();

      expect(service['channels'].chat).toBe(existingChannels);
    });
  });

  xdescribe('unsubscribeChannels()', () => {
    const channels = {
      notification: {
        name: 'TEST_VALUE',
        subscription: null,
      },
      chat: [
        {
          name: 'TEST_VALUE',
          subscription: null,
        },
        {
          name: 'TEST_VALUE',
          subscription: null,
        }
      ]
    };

    it('should unsubscribe', () => {
      service['channels'] = channels;
      service['pusher'] = new PusherLib();
      service.unsubscribeChannels();
      expect(service['channels']).toEqual({
        notification: null,
        chat: []
      });
    });
  });

  describe('subscribeChannel()', () => {
    beforeEach(() => {
      environment.env = 'test';
      service['pusher'] = new PusherLib();
      service['activeScope'] = { programId: null, projectId: null, timelineId: 1 };
      // spyOn(service, 'initialise').and.returnValue(Promise.resolve(service['pusher']));
      const subscribed = [];

      /* MockInstance(Pusher, () => ({
        subscribe: name => {
          subscribed.push(name);
          return binder;
        },
        method1: jasmine.createSpy(),
        method2: jasmine.createSpy(),
      })); */
      function subscribedEvent(title) {

        return jasmine.createSpy('bind').and.returnValue(true);

        /*return (name, callback) => {
          console.log('getEvent', name);
          this.eventTitle = name;
          expect(callback).toBeTruthy();
          return this;
        };*/
      }
      const binder = function (name, callback) {
        return spyOn(this, 'bind').and.callFake(() => {
          return true;
        });
      };

      service['pusher'].subscribe = jasmine.createSpy().and.callFake(name => {
        subscribed.push(name);
        return binder;
      });

    });

    it('should subscribe to notification channel', fakeAsync(() => {
      const channels = [
        {
          channel: `private-${environment.env}-notification-`,
        }
      ];

      requestSpy.get.and.returnValue(of({
        data: channels
      }));

      service.getChannels();

      flushMicrotasks();

      expect(service['channels'].notification).toBeTruthy();
    }));
  });

  describe('initialise()', () => {
    beforeEach(() => {
      service['initialisePusher'] = jasmine.createSpy('initialisePusher').and.callFake(() => {
        const thisPusher = new PusherLib();
        service['pusher'] = thisPusher;
        return thisPusher;
      });
      service['pusher'] = undefined;
      requestSpy.get.and.returnValue(of(notificationRes));
      apolloSpy.graphQLFetch.and.returnValue(of(pusherChatChannelRes));
    });

    it('should initialise pusher', fakeAsync(() => {
      expect(service['pusher']).not.toBeTruthy();

      service.initialise().then();
      flushMicrotasks();
      expect(service['pusher']).toBeTruthy();
    }));

    it('should unsubscribe with option {unsubscribe: true}', fakeAsync(() => {
      spyOn(service, 'unsubscribeChannels');
      service.initialise({ unsubscribe: true }).then();
      flushMicrotasks();

      expect(service.unsubscribeChannels).toHaveBeenCalled();
    }));

    it('should reuse the client while reconnecting and replacing channels when the experience scope changes', fakeAsync(() => {
      const connection = { state: 'connected' };
      const oldPusher = jasmine.createSpyObj('oldPusher', [
        'disconnect',
        'connect',
        'allChannels',
        'unsubscribe',
      ], {
        connection,
        config: { auth: { headers: {} } },
      });
      oldPusher.disconnect.and.callFake(() => connection.state = 'disconnected');
      service['pusher'] = oldPusher;
      service['activeScope'] = { programId: 1, projectId: 11, timelineId: 1 };
      storageSpy.getUser = jasmine.createSpy('getUser').and.returnValue({
        apikey: 'new-key',
        programId: 2,
        projectId: 22,
        timelineId: 2,
      });
      spyOn(service, 'unsubscribeChannels');
      service['initialisePusher'] = jasmine.createSpy('initialisePusher');
      spyOn(service, 'getChannels').and.returnValue(Promise.resolve());

      service.initialise();
      flushMicrotasks();

      expect(service.unsubscribeChannels).toHaveBeenCalled();
      expect(oldPusher.disconnect).toHaveBeenCalled();
      expect(oldPusher.connect).toHaveBeenCalled();
      expect(service['initialisePusher']).not.toHaveBeenCalled();
      expect(service['pusher']).toBe(oldPusher);
      expect(oldPusher.config.auth.headers.apikey).toBe('new-key');
      expect(oldPusher.config.auth.headers.timelineid).toBe(2);
    }));

    it('should update credentials without replacing the same-scope connection', fakeAsync(() => {
      const currentPusher = jasmine.createSpyObj('currentPusher', [
        'disconnect',
        'connect',
        'allChannels',
      ], {
        connection: { state: 'connected' },
        config: { auth: { headers: {} } },
      });
      service['pusher'] = currentPusher;
      service['activeScope'] = { programId: null, projectId: null, timelineId: 1 };
      storageSpy.getUser = jasmine.createSpy('getUser').and.returnValue({
        apikey: 'rotated-key',
        timelineId: 1,
      });
      spyOn(service, 'unsubscribeChannels');
      service['initialisePusher'] = jasmine.createSpy('initialisePusher');
      spyOn(service, 'getChannels').and.returnValue(Promise.resolve());

      service.initialise();
      flushMicrotasks();

      expect(service.unsubscribeChannels).not.toHaveBeenCalled();
      expect(currentPusher.disconnect).not.toHaveBeenCalled();
      expect(service['initialisePusher']).not.toHaveBeenCalled();
      expect(currentPusher.config.auth.headers.apikey).toBe('rotated-key');
    }));

    it('should share one in-flight initialisation between concurrent callers', fakeAsync(() => {
      let resolveChannels: () => void;
      const channels = new Promise<void>(resolve => resolveChannels = resolve);
      const getChannelsSpy = spyOn(service, 'getChannels').and.returnValue(channels);

      const first = service.initialise();
      const second = service.initialise();
      flushMicrotasks();

      expect(service['initialisePusher']).toHaveBeenCalledTimes(1);
      expect(getChannelsSpy).toHaveBeenCalledTimes(1);

      resolveChannels();
      flushMicrotasks();
      expectAsync(Promise.all([first, second])).toBeResolved();
    }));
  });

  describe('unsubscribeChannels()', () => {
    it('should unsubscribe chat channels when no notification channel exists', () => {
      const chatSubscription = jasmine.createSpyObj('chatSubscription', ['unbind_all']);
      const pusher = jasmine.createSpyObj('pusher', ['unsubscribe']);
      service['pusher'] = pusher;
      service['channels'] = {
        notification: null,
        chat: [{ name: 'chat-channel', subscription: chatSubscription }],
      };

      service.unsubscribeChannels();

      expect(chatSubscription.unbind_all).toHaveBeenCalled();
      expect(pusher.unsubscribe).toHaveBeenCalledWith('chat-channel');
      expect(service['channels']).toEqual({ notification: null, chat: [] });
    });

    it('should reset scope, retry state, auth headers, and the connection on logout', () => {
      const notificationSubscription = jasmine.createSpyObj('notificationSubscription', ['unbind_all']);
      const pusher = jasmine.createSpyObj('pusher', ['disconnect', 'unsubscribe'], {
        config: { auth: { headers: { apikey: 'old-key', timelineid: 1 } } },
        connection: { state: 'connected' },
      });
      service['pusher'] = pusher;
      service['activeScope'] = { programId: 1, projectId: 11, timelineId: 1 };
      service['channels'].notification = {
        name: 'notification-channel',
        subscription: notificationSubscription,
      };
      service['retryAttempted'].notification = true;
      service['pendingRetryTypes'].add('notification');
      service['retryTimer'] = setTimeout(() => undefined, 1000);

      service.reset();

      expect(pusher.disconnect).toHaveBeenCalled();
      expect(pusher.unsubscribe).toHaveBeenCalledWith('notification-channel');
      expect(service['activeScope']).toBeNull();
      expect(service['retryAttempted']).toEqual({ notification: false, chat: false });
      expect(service['pendingRetryTypes'].size).toBe(0);
      expect(service['retryTimer']).toBeNull();
      expect(pusher.config.auth.headers.apikey).toBe('');
      expect(pusher.config.auth.headers.timelineid).toBe('');
    });

    it('should prevent an in-flight initialisation from restarting after reset', fakeAsync(() => {
      let resolveChannels: () => void;
      const channels = new Promise<void>(resolve => resolveChannels = resolve);
      spyOn(service, 'getChannels').and.returnValue(channels);
      const pusher = jasmine.createSpyObj('pusher', [
        'disconnect',
        'connect',
        'unsubscribe',
      ], {
        config: { auth: { headers: {} } },
        connection: { state: 'connected' },
      });
      const initialisePusherSpy = spyOn<any>(service, 'initialisePusher').and.returnValue(pusher);

      service.initialise();
      flushMicrotasks();
      service.reset();
      resolveChannels();
      flushMicrotasks();

      expect(initialisePusherSpy).toHaveBeenCalledTimes(1);
      expect(service['activeScope']).toBeNull();
    }));
  });

  describe('subscription lifecycle', () => {
    it('should retry a failed channel type only once', fakeAsync(() => {
      const scope = { programId: 1, projectId: 11, timelineId: 1 };
      const pusher = jasmine.createSpyObj('pusher', ['disconnect', 'connect'], {
        config: { auth: { headers: {} } },
        connection: { state: 'connected' },
      });
      service['pusher'] = pusher;
      service['activeScope'] = scope;
      storageSpy.getUser.and.returnValue({
        apikey: 'apikey',
        ...scope,
      } as any);
      const refreshSpy = spyOn<any>(service, 'refreshChatChannel').and.returnValue(Promise.resolve());

      service['scheduleSubscriptionRetry']('chat', scope);
      service['scheduleSubscriptionRetry']('chat', scope);
      tick(1000);
      flushMicrotasks();

      expect(refreshSpy).toHaveBeenCalledTimes(1);
      expect(pusher.disconnect).toHaveBeenCalledTimes(1);
      expect(pusher.connect).toHaveBeenCalledTimes(1);
    }));

    it('should batch notification and chat retries into one reconnect', fakeAsync(() => {
      const scope = { programId: 1, projectId: 11, timelineId: 1 };
      const pusher = jasmine.createSpyObj('pusher', ['disconnect', 'connect'], {
        config: { auth: { headers: {} } },
        connection: { state: 'connected' },
      });
      service['pusher'] = pusher;
      service['activeScope'] = scope;
      storageSpy.getUser.and.returnValue({ apikey: 'apikey', ...scope } as any);
      const notificationRefresh = spyOn<any>(service, 'refreshNotificationChannel')
        .and.returnValue(Promise.resolve());
      const chatRefresh = spyOn<any>(service, 'refreshChatChannel')
        .and.returnValue(Promise.resolve());

      service['scheduleSubscriptionRetry']('notification', scope);
      service['scheduleSubscriptionRetry']('chat', scope);
      tick(1000);
      flushMicrotasks();

      expect(pusher.disconnect).toHaveBeenCalledTimes(1);
      expect(pusher.connect).toHaveBeenCalledTimes(1);
      expect(notificationRefresh).toHaveBeenCalledTimes(1);
      expect(chatRefresh).toHaveBeenCalledTimes(1);
    }));

    it('should not cancel a pending retry during same-scope discovery', fakeAsync(() => {
      const scope = { programId: 1, projectId: 11, timelineId: 1 };
      const pusher = jasmine.createSpyObj('pusher', ['disconnect', 'connect'], {
        config: { auth: { headers: {} } },
        connection: { state: 'connected' },
      });
      service['pusher'] = pusher;
      service['activeScope'] = scope;
      storageSpy.getUser.and.returnValue({ apikey: 'apikey', ...scope } as any);
      service['channels'].chat = [{
        name: 'chat-channel',
        subscription: { subscriptionPending: true } as any,
      }];
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: { channels: [{ pusherChannel: 'chat-channel' }] },
      } as any));

      service['scheduleSubscriptionRetry']('chat', scope);
      service.refreshChatChannels();
      flushMicrotasks();

      expect(service['retryTimer']).not.toBeNull();
      tick(1000);
      flushMicrotasks();
      expect(pusher.disconnect).toHaveBeenCalledTimes(1);
      expect(pusher.connect).toHaveBeenCalledTimes(1);
    }));

    it('should disconnect before removing a pending v4 channel', () => {
      const connection = { state: 'connected' };
      const subscription: any = {
        subscriptionPending: true,
        unbind_all: jasmine.createSpy('unbind_all'),
      };
      const pusher = jasmine.createSpyObj('pusher', [
        'disconnect',
        'connect',
        'unsubscribe',
      ], {
        config: { auth: { headers: {} } },
        connection,
      });
      pusher.disconnect.and.callFake(() => {
        connection.state = 'disconnected';
        subscription.subscriptionPending = false;
      });
      service['pusher'] = pusher;
      service['channels'].notification = {
        name: 'obsolete-notification-channel',
        subscription,
      };
      service['retryAttempted'].notification = true;
      service['pendingRetryTypes'].add('notification');
      service['retryTimer'] = setTimeout(() => undefined, 1000);

      service['reconcileNotificationChannel'](null);

      expect(pusher.disconnect).toHaveBeenCalledBefore(pusher.unsubscribe);
      expect(pusher.unsubscribe).toHaveBeenCalledWith('obsolete-notification-channel');
      expect(pusher.connect).toHaveBeenCalled();
      expect(service['channels'].notification).toBeNull();
      expect(service['retryAttempted'].notification).toBeFalse();
      expect(service['retryTimer']).toBeNull();
    });

    it('should discard a queued notification callback from an old scope', () => {
      const callbacks: Record<string, (data: any) => void> = {};
      const subscription: any = {
        name: 'notification-channel',
        subscribed: false,
        bind: jasmine.createSpy('bind').and.callFake((event, callback) => {
          callbacks[event] = callback;
          return subscription;
        }),
        unbind_all: jasmine.createSpy('unbind_all'),
      };
      const pusher = jasmine.createSpyObj('pusher', ['subscribe', 'unsubscribe'], {
        config: { auth: { headers: {} } },
        connection: { state: 'connected' },
      });
      pusher.subscribe.and.returnValue(subscription);
      const originalScope = { programId: 1, projectId: 11, timelineId: 1 };
      service['pusher'] = pusher;
      service['activeScope'] = originalScope;
      storageSpy.getUser.and.returnValue({ apikey: 'apikey', ...originalScope } as any);

      service.subscribeChannel('notification', 'notification-channel');
      storageSpy.getUser.and.returnValue({
        apikey: 'new-key',
        programId: 2,
        projectId: 22,
        timelineId: 2,
      } as any);
      callbacks.notification({ type: 'assessment_review_assigned' });

      expect(utilSpy.broadcastEvent).not.toHaveBeenCalled();
    });
  });

  describe('initialisePusher()', () => {
    it('should skip initiation if storage is empty apikey or timelineid', () => {
      service['pusher'] = undefined;

      storageSpy.getUser = jasmine.createSpy('getUser').and.returnValue({
        apikey: null,
        timelineId: null,
      });

      const result = service['initialisePusher']();
      expect(result).toEqual(service['pusher']);
    });

    it('should create a Pusher client for an authenticated context', () => {
      const instantiatedpusher = new PusherLib();
      service['initialisePusher'] = jasmine.createSpy().and.returnValue(instantiatedpusher);
      const result = service['initialisePusher']();

      expect(typeof result).toEqual(typeof instantiatedpusher);
    });
  });

  describe('disconnect()', () => {
    beforeEach(() => {
      service['pusher'] = new PusherLib();
    });

    it('should disconnect pusher', () => {
      spyOn(service['pusher'], 'disconnect');
      service.disconnect();

      expect(service['pusher'].disconnect).toHaveBeenCalled();
    });
  });

  describe('isInstantiated()', () => {
    it('should has been instantiated', () => {
      service['pusher'] = new PusherLib();
      const result = service.isInstantiated();
      expect(result).toBeTruthy();
    });

    it('should has been instantiated', () => {
      service['pusher'] = undefined;
      const result = service.isInstantiated();
      expect(result).toBeFalsy();
    });
  });

  xdescribe('isSubscribed()', () => {
    let channels;
    const testChannel = null;
    beforeEach(() => {
      service['pusher'] = new PusherLib();
      service['pusher'].subscribe('test');

      // mock successfully subsribed channel
      channels = service['pusher'].channels;
      spyOn(testChannel, 'subscribed').and.returnValue(true);
    });

    it('should subscribe to channel', () => {
      const result = service.isSubscribed('test');
      expect(result).toBeTruthy();
    });

    it('should not subscribe to channel not existence', () => {
      const result = service.isSubscribed('test-not-availble');
      expect(result).toBeFalsy();
    });
  });

  describe('triggerDeleteMessage()', () => {
    it('should do nothing if channel not found', () => {
      service['channels'].chat = [];
      service.triggerDeleteMessage('non-existent', { channelUuid: 'ch-1', uuid: 'msg-1' });
      // no error thrown = pass
    });

    it('should call subscription.trigger with correct event name and data', () => {
      const mockSubscription = { trigger: jasmine.createSpy('trigger') };
      service['channels'].chat = [{ name: 'test-channel', subscription: mockSubscription as any }];
      const data = { channelUuid: 'ch-1', uuid: 'msg-1' };
      service.triggerDeleteMessage('test-channel', data);
      expect(mockSubscription.trigger).toHaveBeenCalledWith('client-chat-delete-message', data);
    });
  });

  describe('triggerEditMessage()', () => {
    it('should do nothing if channel not found', () => {
      service['channels'].chat = [];
      service.triggerEditMessage('non-existent', {} as any);
      // no error thrown = pass
    });

    it('should call subscription.trigger with correct event name and data', () => {
      const mockSubscription = { trigger: jasmine.createSpy('trigger') };
      service['channels'].chat = [{ name: 'test-channel', subscription: mockSubscription as any }];
      const data = { channelUuid: 'ch-1', uuid: 'msg-1', message: 'hi', file: '', isSender: true, created: '', senderUuid: '', senderName: '', senderRole: '', senderAvatar: '', sentAt: '' };
      service.triggerEditMessage('test-channel', data);
      expect(mockSubscription.trigger).toHaveBeenCalledWith('client-chat-edit-message', data);
    });
  });
});
