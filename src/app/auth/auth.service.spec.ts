import { AuthService } from './auth.service';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { TestUtils } from '@testing/utils';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserStorageService } from '@services/storage.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { UtilsService } from '@services/utils.service';

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
          useValue: jasmine.createSpyObj('RequestService', ['delete', 'post', 'get'])
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

  it('when testing login(), it should pass the correct data to API', () => {
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
    utilsSpy.has.and.returnValue(true);
    service.login({ email: 'test@test.com', password: '123' }).subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
    expect(requestSpy.post.calls.first().args[1]).toContain('test%40test.com');
    expect(requestSpy.post.calls.first().args[1]).toContain('123');
    expect(storageSpy.setUser.calls.first().args[0]).toEqual({apikey: '123456'});
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
});

