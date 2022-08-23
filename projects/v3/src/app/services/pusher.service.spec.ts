import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed, tick, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { Observable, of, pipe, Subject } from 'rxjs';
import { PusherService } from '@v3/services/pusher.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { MockRouter } from '@testingv3/mocked.service';
import { UtilsService } from '@v3/services/utils.service';
import { RequestService } from 'request';
import { environment } from '@environments/environment';
import { Channel } from 'pusher-js';
import * as Pusher from 'pusher-js';
import { TestUtils } from '@testingv3/utils';
import { ApolloService } from './apollo.service';

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
            graphQLFetch: of(),
            chatGraphQLQuery: of({ data: [] }),
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

  const pusherChatChannelRes = {
    data: {
      channels: [
        {
          pusherChannel: 'fgv34fg-34-8472354eb'
        },
        {
          pusherChannel: 'k76i865-jyj-5f44eb4f'
        }
      ]
    }
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
      apolloSpy.chatGraphQLQuery.and.returnValue(of(pusherChatChannelRes));
      spyOn(service, 'isSubscribed').and.returnValue(true);
      service.getChatChannels().subscribe();
      expect(apolloSpy.chatGraphQLQuery.calls.count()).toBe(1);
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
      service['initialisePusher'] = jasmine.createSpy('initialisePusher').and.returnValue(new Promise(res => {
        const thisPusher = new PusherLib();
        service['pusher'] = thisPusher;
        // spyOn(service['pusher'], 'connect').and.returnValue(true);
        res(thisPusher);
      }));
      service['pusher'] = undefined;
      requestSpy.get.and.returnValue(of(notificationRes));
      apolloSpy.chatGraphQLQuery.and.returnValue(of(pusherChatChannelRes));
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


});

