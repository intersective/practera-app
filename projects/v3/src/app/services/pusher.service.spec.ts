import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { of } from 'rxjs';
import { PusherService } from '@v3/services/pusher.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
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
    super('TESTAPIKEY', { cluster: 'mt1' });

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
  let storageSpy: BrowserStorageService;
  let mockBackend: HttpTestingController;
  let apolloSpy: jasmine.SpyObj<ApolloService>;
  // let pusherLibSpy: any;

  beforeEach(() => {
    // spyOn(Window, 'Pusher');
    // pusherLibSpy = new PusherLib(this.pusherKey, libConfig);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
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
            graphQLFetch: of({ data: { notificationChannel: null, channels: [] } })
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
    storageSpy = TestBed.inject(BrowserStorageService);
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
  };

  describe('getChannels()', async () => {

    it('calls graphQLFetch with the notificationChannel query', () => {
      apolloSpy.graphQLFetch.and.returnValue(of({ data: { notificationChannel: null } }));
      spyOn(service, 'isSubscribed').and.returnValue(true);
      service.getNotificationChannel().subscribe();
      expect(apolloSpy.graphQLFetch).toHaveBeenCalledWith(
        jasmine.stringContaining('notificationChannel'),
        jasmine.objectContaining({ variables: { env: environment.env } })
      );
    });

    it('should call getChatChannels() and make API request to chat GraphQL Server', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(pusherChatChannelRes));
      spyOn(service, 'isSubscribed').and.returnValue(true);
      service.getChatChannels().subscribe();
      expect(apolloSpy.graphQLFetch.calls.count()).toBe(1);
    });
  });

  describe('subscribeChannel()', () => {
    beforeEach(() => {
      environment.env = 'test';
      service['pusher'] = new PusherLib();
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
      const channelName = `private-${environment.env}-notification-`;

      apolloSpy.graphQLFetch.and.returnValue(of({
        data: { notificationChannel: channelName, channels: [] }
      }));

      service.getChannels();

      flushMicrotasks();

      expect(service['channels'].notification).toBeTruthy();
    }));
  });

  describe('initialise()', () => {
    beforeEach(() => {
      service['initialisePusher'] = jasmine.createSpy('initialisePusher').and.returnValue(new Promise(res => {
        const thisPusher = new PusherLib();
        service['pusher'] = thisPusher;
        // spyOn(service['pusher'], 'connect').and.returnValue(true);
        res(thisPusher);
      }));
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
  });

  describe('initialisePusher()', () => {
    it('should skip initiation if storage is empty apikey or timelineid', fakeAsync(() => {
      service['pusher'] = undefined;

      storageSpy.getUser = jasmine.createSpy('getUser').and.returnValue({
        apikey: null,
        timelineId: null,
      });

      let result;
      service['initialisePusher']().then(res => {
        result = res;
      });

      flushMicrotasks();
      expect(result).toEqual(service['pusher']);
    }));

    it('should return instantiated pusher is there is existing one', fakeAsync(() => {
      const instantiatedpusher = new PusherLib();
      service['pusher'] = instantiatedpusher;
      let result;
      service['initialisePusher']().then(res => {
        result = res;
      });
      flushMicrotasks();

      expect(typeof result).toEqual(typeof instantiatedpusher);
    }));
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

  describe('normaliseTemplateValue() (private, tested via resolveUseTLS)', () => {
    it('returns empty string for unsubstituted template placeholders like <FOO>', () => {
      // normaliseTemplateValue is called by resolveUseTLS when pusherUseTLS is a placeholder
      const originalUseTLS = environment.pusherUseTLS;
      (environment as any).pusherUseTLS = '<CUSTOMPLAIN_PUSHERUSETLS>';
      // resolveUseTLS will normalise the placeholder to '' and default to TLS=true
      const useTLS: boolean = service['resolveUseTLS']();
      expect(useTLS).toBe(true); // placeholder → empty → default true
      (environment as any).pusherUseTLS = originalUseTLS;
    });

    it('returns false when pusherUseTLS is explicitly set to "false"', () => {
      const originalUseTLS = environment.pusherUseTLS;
      (environment as any).pusherUseTLS = 'false';
      const useTLS: boolean = service['resolveUseTLS']();
      expect(useTLS).toBe(false);
      (environment as any).pusherUseTLS = originalUseTLS;
    });

    it('returns true when pusherUseTLS is set to "true"', () => {
      const originalUseTLS = environment.pusherUseTLS;
      (environment as any).pusherUseTLS = 'true';
      const useTLS: boolean = service['resolveUseTLS']();
      expect(useTLS).toBe(true);
      (environment as any).pusherUseTLS = originalUseTLS;
    });
  });

  describe('resolvePusherPort() (private)', () => {
    it('returns undefined when pusherPort is not configured', () => {
      const originalPort = environment.pusherPort;
      (environment as any).pusherPort = '';
      const port = service['resolvePusherPort'](true);
      expect(port).toBeUndefined();
      (environment as any).pusherPort = originalPort;
    });

    it('returns undefined when pusherPort is an unsubstituted template', () => {
      const originalPort = environment.pusherPort;
      (environment as any).pusherPort = '<CUSTOMPLAIN_PUSHERPORT>';
      const port = service['resolvePusherPort'](true);
      expect(port).toBeUndefined();
      (environment as any).pusherPort = originalPort;
    });

    it('returns the numeric port when pusherPort is a valid number string', () => {
      const originalPort = environment.pusherPort;
      (environment as any).pusherPort = '6001';
      const port = service['resolvePusherPort'](true);
      expect(port).toBe(6001);
      (environment as any).pusherPort = originalPort;
    });

    it('returns undefined when pusherPort is not a valid integer', () => {
      const originalPort = environment.pusherPort;
      (environment as any).pusherPort = 'not-a-number';
      const port = service['resolvePusherPort'](true);
      expect(port).toBeUndefined();
      (environment as any).pusherPort = originalPort;
    });
  });
});

