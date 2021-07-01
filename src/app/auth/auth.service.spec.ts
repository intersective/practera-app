import { AuthService } from './auth.service';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { TestUtils } from '@testing/utils';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserStorageService } from '@services/storage.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { UtilsService } from '@services/utils.service';
import { request } from 'http';

describe('AuthService', () => {
  let service: AuthService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let pusherSpy: jasmine.SpyObj<PusherService>;
  let utilsSpy: jasmine.SpyObj<UtilsService>;
  const testUtils = new TestUtils();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        AuthService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['delete', 'post', 'get', 'graphQLQuery'])
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['setUser', 'getUser', 'set', 'getConfig', 'setConfig', 'get', 'clear'])
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['has', 'changeThemeColor', 'openUrl'])
        },
        {
          provide: PusherService,
          useValue: jasmine.createSpyObj('PusherService', ['unsubscribeChannels', 'disconnect'])
        },
      ]
    });
    service = TestBed.inject(AuthService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    pusherSpy = TestBed.inject(PusherService) as jasmine.SpyObj<PusherService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const mockStacks = [
    {
      uuid: 'b0f6328e-379c-4cd2-9e96-1363a49ab001',
      name: 'Practera Classic App - Stage',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'https://app.p1-stage.practera.com',
      api: 'https://admin.p1-stage.practera.com',
      appkey: 'b11e7c189b',
      type: 'app',
      coreApi: 'https://admin.p1-stage.practera.com',
      coreGraphQLApi: 'https://core-graphql-api.p1-stage.practera.com',
      chatApi: 'https://chat-api.p1-stage.practera.com',
      filestack: {
        s3Config: {
          container: 'files.p1-stage.practera.com',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS'
    },
    {
      uuid: '9c31655d-fb73-4ea7-8315-aa4c725b367e',
      name: 'Practera Classic App - Sandbox',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'https://app.p1-sandbox.practera.com',
      api: 'https://admin.p1-sandbox.practera.com',
      appkey: 'b11e7c189b',
      type: 'app',
      coreApi: 'https://admin.p1-sandbox.practera.com',
      coreGraphQLApi: 'https://core-graphql-api.p1-sandbox.practera.com',
      chatApi: 'https://chat-api.p1-sandbox.practera.com',
      filestack: {
        s3Config: {
          container: 'files.p1-sandbox.practera.com',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS'
    },
    {
      uuid: 'f4f85069-ca3b-4044-905a-e366b724af6b',
      name: 'Practera App - Local Development',
      description: 'Participate in an experience as a learner or reviewer - Local',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'http://127.0.0.1:4200/',
      api: 'http://127.0.0.1:8080/',
      appkey: 'b11e7c189b',
      type: 'app',
      coreApi: 'http://127.0.0.1:8080',
      coreGraphQLApi: 'http://127.0.0.1:8000',
      chatApi: 'http://localhost:3000/local/graphql',
      filestack: {
        s3Config: {
          container: 'practera-aus',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS'
    }
  ];
  const mockOneStack = [
    {
      uuid: 'b0f6328e-379c-4cd2-9e96-1363a49ab001',
      name: 'Practera Classic App - Stage',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'https://app.p1-stage.practera.com',
      api: 'https://admin.p1-stage.practera.com',
      appkey: 'b11e7c189b',
      type: 'app',
      coreApi: 'https://admin.p1-stage.practera.com',
      coreGraphQLApi: 'https://core-graphql-api.p1-stage.practera.com',
      chatApi: 'https://chat-api.p1-stage.practera.com',
      filestack: {
        s3Config: {
          container: 'files.p1-stage.practera.com',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS'
    }
  ];

  it('when testing login(), it should pass the correct data to API', () => {
    requestSpy.post.and.returnValue(of({
      apikey: '123456',
      stacks: mockStacks
    }));
    service.login({ username: 'test@test.com', password: '123' }).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
    expect(requestSpy.post.calls.first().args[1].username).toEqual('test@test.com');
    expect(requestSpy.post.calls.first().args[1].password).toEqual('123');
    expect(requestSpy.post.calls.first().args[1].from).toEqual('App');
  });

  it('when testing directLogin(), it should pass the correct data to API', () => {
    requestSpy.post.and.returnValue(of({
      success: true,
      data: {
        tutorial: null,
        apikey: '123456',
        Timelines: [
          {
            Program: {
              config: {
                theme_color: 'abc'
              }
            },
            Enrolment: {},
            Project: {},
            Timeline: {}
          }
        ]
      }
    }));
    storageSpy.getConfig.and.returnValue(true);
    service.directLogin({ authToken: 'abcd' }).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
    expect(requestSpy.post.calls.first().args[1]).toContain('abcd');
    expect(storageSpy.setUser.calls.first().args[0]).toEqual({apikey: '123456'});
  });

  it('when testing directLoginWithApikey(), it should pass the correct data to API', () => {
    requestSpy.post.and.returnValue(of({
      success: true,
      data: {
        tutorial: null,
        apikey: '123456',
        Timelines: [
          {
            Program: {
              config: {
                theme_color: 'abc'
              }
            },
            Enrolment: {},
            Project: {},
            Timeline: {}
          }
        ]
      }
    }));
    storageSpy.getConfig.and.returnValue(true);
    service.directLoginWithApikey({ apikey: 'abcd', service: 'LOGIN' }).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
    expect(requestSpy.post.calls.first().args[1]).toContain('abcd');
    expect(storageSpy.setUser.calls.first().args[0]).toEqual({apikey: '123456'});
  });

  describe('when testing isAuthenticated()', () => {
    it('should return true', () => {
      storageSpy.get.and.returnValue(true);
      expect(service.isAuthenticated()).toBe(true);
    });
    it('should return false', () => {
      storageSpy.get.and.returnValue(false);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('when testing logout()', () => {
    it('should navigate to login by default', () => {
      storageSpy.getConfig.and.returnValue({color: ''});
      service.logout({});
      expect(pusherSpy.unsubscribeChannels.calls.count()).toBe(1);
      expect(pusherSpy.disconnect.calls.count()).toBe(1);
      expect(storageSpy.clear.calls.count()).toBe(1);
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['login']);
    });
    it('should pass navigation data', () => {
      storageSpy.getConfig.and.returnValue({color: ''});
      service.logout({data: 'data'});
      expect(pusherSpy.unsubscribeChannels.calls.count()).toBe(1);
      expect(pusherSpy.disconnect.calls.count()).toBe(1);
      expect(storageSpy.clear.calls.count()).toBe(1);
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['login']);
      expect(routerSpy.navigate.calls.first().args[1]).toEqual({data: 'data'});
    });

    it('should not navigate to login when it is called with redirect = false', () => {
      storageSpy.getConfig.and.returnValue({color: ''});
      service.logout({}, false);
      expect(routerSpy.navigate.calls.count()).toBe(0);
    });
  });

  it('when testing forgotPassword()', () => {
    requestSpy.post.and.returnValue(of(''));
    service.forgotPassword('test@test.com').subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
    expect(requestSpy.post.calls.first().args[1].email).toEqual('test@test.com');
  });

  it('when testing resetPassword()', () => {
    requestSpy.post.and.returnValue(of(''));
    service.resetPassword({}).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });

  describe('when testing linkedinAuthenticated()', () => {
    it('should return true', () => {
      storageSpy.getUser.and.returnValue({ linkedinConnected: true });
      expect(service.linkedinAuthenticated()).toBe(true);
    });
    it('should return false', () => {
      storageSpy.getUser.and.returnValue({});
      expect(service.linkedinAuthenticated()).toBe(false);
    });
  });

  it('when testing connectToLinkedIn()', () => {
    storageSpy.getUser.and.returnValue({ apikey: 'abc', timelineId: 1 });
    storageSpy.get.and.returnValue('aaa');
    service.connectToLinkedIn();
    expect(utilsSpy.openUrl.calls.count()).toBe(1);
  });

  describe('when testing contactNumberLogin()', () => {
    it('should set correct data to local storage', () => {
      requestSpy.post.and.returnValue(of({
        data: {
          apikey: 'aaa',
          tutorial: false,
          timelines: []
        }
      }));
      service.contactNumberLogin({ contactNumber: '123' }).subscribe();
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(storageSpy.setUser.calls.first().args[0].apikey).toEqual('aaa');
      expect(storageSpy.set.calls.count()).toBe(2);
    });
    it('should not set data if response format incorrect', () => {
      requestSpy.post.and.returnValue(of({}));
      service.contactNumberLogin({ contactNumber: '123' }).subscribe();
      expect(requestSpy.post.calls.count()).toBe(1);
      expect(storageSpy.set.calls.count()).toBe(0);
    });
  });

  it('when testing checkDomain()', () => {
    requestSpy.get.and.returnValue(of(''));
    service.checkDomain({domain: 'localhost'}).subscribe();
    expect(requestSpy.get.calls.count()).toBe(1);
  });

  it('when testing updateProfile()', () => {
    requestSpy.post.and.returnValue(of(''));
    service.updateProfile({ contactNumber: '124' }).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });

  it('when testing saveRegistration()', () => {
    requestSpy.post.and.returnValue(of(''));
    service.saveRegistration({ user_id: 1, password: '123', key: 'key' }).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });

  it('when testing verifyRegistration()', () => {
    requestSpy.post.and.returnValue(of(''));
    service.verifyRegistration({ email: 'test@test.com', key: 'key' }).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });

  it('when testing verifyResetPassword()', () => {
    requestSpy.post.and.returnValue(of(''));
    service.verifyResetPassword({ email: 'test@test.com', key: 'key' }).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });

  describe('getUUID()', function () {
    it('should get user uuid in string', () => {
      const UUID = 'SAMPLE-UUID';
      requestSpy.graphQLQuery.and.returnValue(of({
        data: {
          user: {
            uuid: UUID
          }
        }
      }));
      service.getUUID().subscribe(result => {
        expect(result).toBe(UUID);
      });
    });

    it('should return null when data object is undefined', () => {
      requestSpy.graphQLQuery.and.returnValue(of({
        data: undefined
      }));
      service.getUUID().subscribe(result => {
        expect(result).toBeNull();
      });
    });
  });

  describe('getStackConfig()', () => {
    const sample_uuid = 'abcdefg_hijklmn_opqrstu_vwxyz';
    it('should make GET request to LoginAPI', () => {
      const sample_result: any = {
        data: {
          sample_result: sample_uuid
        }
      };
      requestSpy.get.and.returnValue(of(sample_result));
      service.getStackConfig(sample_uuid).subscribe(result => {
        expect(result).toEqual(sample_result.data);
        expect(requestSpy.get).toHaveBeenCalledWith('https://login.practera.com/stack', { uuid: sample_uuid });
      });
    });

    it('should fail with returning null', () => {
      requestSpy.get.and.returnValue(of(null));
      service.getStackConfig(sample_uuid).subscribe(result => {
        expect(result).toBeFalsy();
        expect(requestSpy.get).toHaveBeenCalledWith('https://login.practera.com/stack', { uuid: sample_uuid });
      });
    });
  });
});

