import { AuthService } from './auth.service';
import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { TestUtils } from '@testing/utils';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserStorageService } from '@services/storage.service';
import { NativeStorageService } from '@services/native-storage.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { UtilsService } from '@services/utils.service';
import { NativeStorageServiceMock } from '@testing/mocked.service';

describe('AuthService', () => {
  let service: AuthService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  let nativeStorageSpy: jasmine.SpyObj<NativeStorageService>;
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
          provide: NativeStorageService,
          useClass: NativeStorageServiceMock
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
    nativeStorageSpy = TestBed.inject(NativeStorageService) as jasmine.SpyObj<NativeStorageService>;
    pusherSpy = TestBed.inject(PusherService) as jasmine.SpyObj<PusherService>;
    utilsSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('when testing login(), it should pass the correct data to API', fakeAsync(() => {
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

    tick();
    expect(nativeStorageSpy.setObject).toHaveBeenCalledWith('me', {apikey: '123456'});
    expect(nativeStorageSpy.setObject).toHaveBeenCalledWith('isLoggedIn', {isLoggedIn: true});
    expect(nativeStorageSpy.setObject).toHaveBeenCalledWith('programs', [ {
      enrolment: {  },
      program: { config: { theme_color: 'abc' } },
      project: {  },
      timeline: {  }
    } ]);
  }));

  it('when testing directLogin(), it should pass the correct data to API', fakeAsync(() => {
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
    service.logout = jasmine.createSpy().and.returnValue(true);
    nativeStorageSpy.getObject.and.returnValue(true);
    const direction = service.directLogin({ authToken: 'abcd' });
    direction.then(res => {
      res.subscribe(login => {
        expect(requestSpy.post.calls.count()).toBe(1);
        expect(requestSpy.post.calls.first().args[1]).toContain('abcd');
        expect(nativeStorageSpy.setObject).toHaveBeenCalledWith('me', {apikey: '123456'});
      });
    });
    flush();
  }));

  describe('when testing isAuthenticated()', () => {
    it('should return true', fakeAsync(() => {
      nativeStorageSpy.getObject.and.returnValue({
        isLoggedIn: true
      });
      service.isAuthenticated().then(authenticated => {
        expect(nativeStorageSpy.getObject).toHaveBeenCalledWith('isLoggedIn');
        expect(authenticated).toEqual(true);
      });
      flush();
    }));

    it('should return false', fakeAsync(() => {
      nativeStorageSpy.getObject.and.returnValue({
        isLoggedIn: false
      });
      service.isAuthenticated().then(authenticated => {
        expect(nativeStorageSpy.getObject).toHaveBeenCalledWith('isLoggedIn');
        expect(authenticated).toEqual(false);
      });
      flush();
    }));
  });

  describe('when testing logout()', () => {
    it('should navigate to login by default', fakeAsync(() => {
      nativeStorageSpy.getObject.and.returnValue({ color: '' });
      service.logout({});
      tick();
      expect(pusherSpy.unsubscribeChannels.calls.count()).toBe(1);
      expect(pusherSpy.disconnect.calls.count()).toBe(1);
      expect(nativeStorageSpy.getObject).toHaveBeenCalledWith('config');
      expect(nativeStorageSpy.setObject).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate.calls.first().args[0]).toEqual(['login']);
    }));

    it('should pass navigation data', fakeAsync(() => {
      const logoutData = { data: 'data' };
      nativeStorageSpy.getObject.and.returnValue({color: ''});
      service.logout(logoutData);
      tick();
      expect(pusherSpy.unsubscribeChannels.calls.count()).toBe(1);
      expect(pusherSpy.disconnect.calls.count()).toBe(1);
      expect(nativeStorageSpy.clear).toHaveBeenCalledTimes(1);
      expect(nativeStorageSpy.getObject).toHaveBeenCalledWith('config');
      expect(nativeStorageSpy.setObject).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigate.calls.first().args[1]).toEqual(logoutData);
    }));

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

  describe('when testing contactNumberLogin()', () => {
    it('should set correct data to local storage', fakeAsync(() => {
      const apikey = 'aaa';
      requestSpy.post.and.returnValue(of({
        data: {
          apikey,
          tutorial: false,
          timelines: []
        }
      }));
      service.contactNumberLogin({ contactNumber: '123' }).subscribe();
      tick();
      expect(requestSpy.post).toHaveBeenCalledTimes(1);
      expect(nativeStorageSpy.setObject).toHaveBeenCalledWith('me', {apikey: apikey});
      expect(nativeStorageSpy.setObject).toHaveBeenCalledTimes(2);
    }));

    it('should not set data if response format incorrect', fakeAsync(() => {
      requestSpy.post.and.returnValue(of({}));
      service.contactNumberLogin({ contactNumber: '123' }).subscribe();
      tick();
      expect(requestSpy.post).toHaveBeenCalledTimes(1);
      expect(nativeStorageSpy.setObject).toHaveBeenCalledTimes(0);
    }));
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

