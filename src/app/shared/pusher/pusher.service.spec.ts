import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, inject, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { Observable, of, pipe } from 'rxjs';
import { PusherService, PusherConfig } from '@shared/pusher/pusher.service';
import { BrowserStorageService } from '@services/storage.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { MockRouter } from '@testing/mocked.service';
import { UtilsService } from '@services/utils.service';
import { RequestService } from '@shared/request/request.service';
import { environment } from '@environments/environment';
import * as Pusher from 'pusher-js';

class PusherLib extends Pusher {
  connection;

  constructor(a, b) {
    super('TESTAPIKEY');
    console.log(a, b);
    this.connection = {
      state: 'test',
    };
    /*jasmine.spy('connection').and.returnValue({

    });*/
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

describe('PusherConfig', () => {
  const config = new PusherConfig();

  it('should have pusherKey & apiurl', () => {
    expect(config.pusherKey).toEqual('');
    expect(config.apiurl).toEqual('');
  });
});

describe('PusherService', async () => {
  const PUSHERKEY = 'pusherKey';
  const APIURL = 'api/v2/message/notify/channels.json';
  const libConfig =  {
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
  let mockBackend: HttpTestingController;
  // let pusherLibSpy: any;

  beforeEach(() => {
    // spyOn(Window, 'Pusher');
    // pusherLibSpy = new PusherLib(this.pusherKey, libConfig);

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        PusherService,
        UtilsService,
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
        {
          provide: PusherConfig,
          useValue: {
            pusherKey: PUSHERKEY,
            apiurl: 'apiurl'
          }
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', {
            get: of({ data: [] }),
            apiResponseFormatError: 'ERROR'
          }),
        }
      ],
    }).compileComponents();

    mockBackend = TestBed.get(HttpTestingController);
    service = TestBed.get(PusherService);
    requestSpy = TestBed.get(RequestService);
    utilSpy = TestBed.get(UtilsService);
  });

  it('should create', () => {
    expect(service).toBeDefined();
  });

  describe('getChannels()', () => {

    it(`should make API request to ${APIURL}`, fakeAsync(() => {
      service.getChannels().subscribe();
      spyOn(service, 'initiateTypingEvent');
      tick(300);
      expect(requestSpy.get).toHaveBeenCalledWith(APIURL, {
        params: { env: environment.env }
      });
    }));

    it(`should return error if channel is empty`, fakeAsync(() => {
      requestSpy.get.and.returnValue(of({ data: 'not array' }));
      spyOn(service, 'initiateTypingEvent');

      let res: any;
      service.getChannels().subscribe(_res => {
        res = _res;
      });
      tick(300);

      // expect(utilSpy.isEmpty).toHaveBeenCalled();
      expect(requestSpy.apiResponseFormatError).toHaveBeenCalledWith('Pusher channels must be an array');
      expect(service.initiateTypingEvent).not.toHaveBeenCalled();
    }));

    // it('should ')
  });

  describe('unsubscribeChannels()', () => {
    const TESTVALUE = {
      presence: {
        name: 'TEST_VALUE',
        subscription: 'TEST_VALUE',
      },
      team: {
        name: 'TEST_VALUE',
        subscription: 'TEST_VALUE',
      },
      teamNoMentor: {
        name: 'TEST_VALUE',
        subscription: 'TEST_VALUE',
      },
      notification: {
        name: 'TEST_VALUE',
        subscription: 'TEST_VALUE',
      }
    };

    const channels = {
      presence: {
        unbind_all: jasmine.createSpy('unbind_all'),
      },
      team: {
        unbind_all: jasmine.createSpy('unbind_all'),
      },
      teamNoMentor: {
        unbind_all: jasmine.createSpy('unbind_all'),
      },
      notification: {
        unbind_all: jasmine.createSpy('unbind_all'),
      },
    };

    it('should unsubscribe', () => {
      service['channelNames'] = TESTVALUE;
      service['channels'] = channels;
      service.unsubscribeChannels();

      expect(service['channels'].presence).toEqual(null);
      expect(service['channels']).toEqual({
        presence: null,
        team: null,
        teamNoMentor: null,
        notification: null,
      });
    });
  });

  /*xdescribe('initialise()', () => {
    it('should initialise pusher', fakeAsync(() => {
      service['initialisePusher'] = () => new Promise((resolve) => {
        resolve(initialisingPusher);
      });
      spyOn(service, 'initialisePusher').and.returnValue(new Promise((resolve) => {
        resolve(initialisingPusher);
      }));

      expect(service['pusher']).not.toBeTruthy();
      expect(service['apiurl']).toBe('apiurl');

      service.initialise().then(res => {
        tick();
        expect(res.pusher).toBeTruthy();
        expect(res.pusher.connection).toBeTruthy();
      });
    }));
  });*/

  describe('disconnect()', () => {
    it('should disconnect pusher', () => {
      service['pusher'] = { ...initialisingPusher, disconnect: () => true };
      spyOn(service['pusher'], 'disconnect');

      service.disconnect();
      expect(service['pusher'].disconnect).toHaveBeenCalled();
    });
  });

  describe('isInstantiated()', () => {
    it('should has been instantiated', () => {
      service['pusher'] = {
        connection: {
          state: 'connected',
          key: '',
          options: '',
          socket_id: '',
        }
      };

      const result = service.isInstantiated();
      expect(result).toBeTruthy();
    });

    it('should has been instantiated', () => {
      service['pusher'] = undefined;

      const result = service.isInstantiated();
      expect(result).toBeFalsy();
    });
  });

  describe('isSubscribed()', () => {
    beforeEach(() => {
      service['pusher'] = {
        allChannels: () => [
          { name: 'test', subscribed: true, trigger: (eventName: string, data?: any) => true }
        ]
      };
      /*spyOn(service['pusher'], 'allChannels').and.returnValue([
        { name: 'test', subscribed: true, trigger: (eventName: string, data?: any) => true }
      ]);*/
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

  describe('getMyPresenceChannelId()', () => {
    it('should get my channel id', () => {
      const id = '7b6f112e7e55968fd8c34d5727e4996d';
      const sampleData = {
        'channel': 'presence-sandbox-team-1234-567-89',
        'data': {
          'presence': {
            'count': 1,
            'ids': [
              id
            ],
            'hash': {
              '7b6f112e7e55968fd8c34d5727e4996d': {
                name: 'test',
              },
            },
            'members': {
              'test-data': { id: 'test-data' },
              'not-actual-user': { id: 'not-actual-user' },
              'me': { id },
            },
          },
        }
      };

      // in codebase, `this.channels.member`
      service['channels']['presence'] = sampleData.data.presence;
      const result = service.getMyPresenceChannelId();
      expect(result).toEqual(id);
    });
  });

  describe('typing message', () => {
    it('should trigger triggerTyping()', () => {});
    it('should trigger initiateTypingEvent()', () => {});
  });

  /*it('should disconnect()', () => {
    service.disconnect();
  });*/

});

