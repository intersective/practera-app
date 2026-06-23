import {
  fakeAsync,
  tick,
  TestBed,
} from '@angular/core/testing';

import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';

import { RequestService, RequestConfig, DevModeService, QueryEncoder } from './request.service';
import { Router } from '@angular/router';
import { BrowserStorageService } from '@v3/services/storage.service';
import { TestUtils } from '@testingv3/utils';
import { BrowserStorageServiceMock } from '@testingv3/mocked.service';
import { UtilsService } from '@v3/services/utils.service';

describe('QueryEncoder', () => {
  const encodedTest = 'https://test.com?test=true';
  const decodedTest = 'https%3A%2F%2Ftest.com%3Ftest%3Dtrue';
  let encoder: QueryEncoder;

  beforeEach(() => {
    encoder = new QueryEncoder();
  });

  it('should encode string', () => {
    expect(encoder.encodeKey).toBeTruthy();
    expect(encoder.encodeValue).toBeTruthy();
    expect(encoder.encodeKey(encodedTest)).toEqual(decodedTest);
    expect(encoder.encodeValue(encodedTest)).toEqual(decodedTest);
  });

  it('should decode string', () => {
    expect(encoder.decodeKey).toBeTruthy();
    expect(encoder.decodeValue).toBeTruthy();
    expect(encoder.decodeKey(decodedTest)).toEqual(encodedTest);
    expect(encoder.decodeValue(decodedTest)).toEqual(encodedTest);
  });
});

describe('DevModeService', () => {
  it('isDevMode() should return true', () => {
    expect(new DevModeService().isDevMode()).toBeTruthy();
  });
});

describe('RequestConfig', () => {
  let requestConfig: RequestConfig;
  beforeEach(() => {
    requestConfig = new RequestConfig();
  });

  it('should readily accept both appkey & prefixUrl value', () => {
    expect(requestConfig.appkey).toBe('');
    expect(requestConfig.prefixUrl).toBe('');
  });
});

describe('RequestService', () => {
  const PREFIX_URL = 'test.com';
  const SCHEME_DOMAIN = `https://${PREFIX_URL}/`;
  const APPKEY = 'TESTAPPKEY';
  const routerSpy = TestUtils.createRouterSpy();

  let service: RequestService;
  let mockBackend: HttpTestingController;
  let requestConfigSpy: RequestConfig;
  let devModeServiceSpy: DevModeService;
  let storageSpy: BrowserStorageService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RequestService,
        DevModeService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: RequestConfig,
          useValue: {
            appkey: APPKEY,
            prefixUrl: SCHEME_DOMAIN,
          }
        },
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock
        }
      ]
    });

    service = TestBed.inject(RequestService);
    mockBackend = TestBed.inject(HttpTestingController);
    requestConfigSpy = TestBed.inject(RequestConfig);
    devModeServiceSpy = TestBed.inject(DevModeService);
    storageSpy = TestBed.inject(BrowserStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    const testURL = `https://${PREFIX_URL}`;

    it('should perform a GET request based on provided URL', fakeAsync(() => {
      let res = { body: true };

      service.get(testURL, { params: { justFor: 'test' } }).subscribe(_res => {
        res = _res;
      });
      const req = mockBackend.expectOne({ method: 'GET' });
      req.flush(res);

      tick();

      const { body } = res;
      expect(req.request.url).toBe(testURL);
      expect(body).toBe(true);

      mockBackend.verify();
    }));

    it('should update apikey if new apikey exist', () => {
      let res = { body: true, apikey: 'testapikey' };
      service.get(testURL, { headers: { some: 'keys' } }).subscribe(_res => {
        res = _res;
      });
      const req = mockBackend.expectOne({ method: 'GET' });
      req.flush(res);

      expect(storageSpy.setUser).toHaveBeenCalledWith({ apikey: res.apikey });
      mockBackend.verify();
    });

    it('should perform error handling when fail', fakeAsync(() => {
      spyOn(devModeServiceSpy, 'isDevMode').and.returnValue(false);

      const ERR_MESSAGE = 'Invalid request parameter';
      const err = { success: false, status: 400, statusText: 'Bad Request' };
      let res: any;
      let errRes: any;
      service.get(testURL).subscribe(
        _res => {
          res = _res;
        },
        _err => {
          errRes = _err;
        }
      );
      const req = mockBackend.expectOne({ url: testURL, method: 'GET' }).flush(ERR_MESSAGE, err);

      expect(res).toBeUndefined();
      expect(errRes).toEqual(ERR_MESSAGE);
      mockBackend.verify();

    }));
  });

  describe('post()', () => {
    const testURL = 'https://www.post-test.com';
    const sampleData = {
      sample: 'data'
    };

    it('should perform a POST request based on Login API URL', fakeAsync(() => {
      let res = { body: true };

      service.post(
        {
          endPoint: testURL,
          data: sampleData,
        }
      ).subscribe(_res => {
        res = _res;
      });
      const req = mockBackend.expectOne({ method: 'POST' });
      req.flush(res);

      tick();

      const { body } = res;
      expect(req.request.url).toBe(testURL);
      expect(body).toBe(true);

      mockBackend.verify();
    }));

    it('should perform a POST request based on provided URL', fakeAsync(() => {
      const testURL = 'login';

      let res = { body: true };

      service.post(
        {
          endPoint: testURL,
          data: sampleData,
        }).subscribe(_res => {
          res = _res;
        });
      const req = mockBackend.expectOne({ method: 'POST' });
      req.flush(res);

      tick();

      const { body } = res;
      expect(req.request.url).toBe(`https://${PREFIX_URL}/${testURL}`);
      expect(body).toBe(true);

      mockBackend.verify();
    }));

    it('should perform error handling when fail', fakeAsync(() => {
      spyOn(devModeServiceSpy, 'isDevMode').and.returnValue(false);

      const ERR_MESSAGE = 'Invalid POST Request';
      const err = { success: false, status: 400, statusText: 'Bad Request' };
      let res: any;
      let errRes: any;
      service.post(
        {
          endPoint: testURL,
          data: sampleData,
        }
      ).subscribe(
        _res => {
          res = _res;
        },
        _err => {
          errRes = _err;
        }
      );
      const req = mockBackend.expectOne({ url: testURL, method: 'POST' }).flush(ERR_MESSAGE, err);

      expect(res).toBeUndefined();
      mockBackend.verify();
    }));
  });

  describe('put()', () => {
    let testURL = 'put-test';
    const sampleData = {
      sample: 'data'
    };

    it('should perform a PUT request based on Login API URL', fakeAsync(() => {
      let res = { body: true };

      service.put(testURL, sampleData, {}).subscribe(_res => {
        res = _res;
      });
      const req = mockBackend.expectOne({ method: 'PUT' });
      req.flush(res);

      tick();

      const { body } = res;
      expect(req.request.url).toBe(`https://${PREFIX_URL}/${testURL}`);
      expect(body).toBe(true);

      mockBackend.verify();
    }));

    it('should perform a PUT request based on provided URL', fakeAsync(() => {
      testURL = 'login';

      let res = { body: true };

      service.put(testURL, sampleData, {}).subscribe(_res => {
        res = _res;
      });
      const req = mockBackend.expectOne({ method: 'PUT' });
      req.flush(res);

      tick();

      const { body } = res;
      expect(req.request.url).toBe(`https://${PREFIX_URL}/${testURL}`);
      expect(body).toBe(true);

      mockBackend.verify();
    }));

    it('should perform error handling when fail', fakeAsync(() => {
      spyOn(devModeServiceSpy, 'isDevMode').and.returnValue(false);

      const ERR_MESSAGE = 'Invalid PUT Request';
      const err = { success: false, status: 400, statusText: 'Bad Request' };
      let res: any;
      let errRes: any;
      service.put(testURL, sampleData, {}).subscribe(
        _res => {
          res = _res;
        },
        _err => {
          errRes = _err;
        }
      );
      const req = mockBackend.expectOne({ url: `https://${PREFIX_URL}/${testURL}`, method: 'PUT' }).flush(ERR_MESSAGE, err);

      expect(res).toBeUndefined();
      expect(errRes).toEqual(ERR_MESSAGE);
      mockBackend.verify();
    }));
  });

  describe('delete()', () => {
    const testURL = 'delete-test';

    it('should perform a GET request based on provided URL', fakeAsync(() => {
      let res = { body: true };

      service.delete(`${testURL}`).subscribe(_res => {
        res = _res;
      });
      const req = mockBackend.expectOne({ method: 'DELETE' });
      req.flush(res);

      tick();

      const { body } = res;
      expect(req.request.url).toBe(`${SCHEME_DOMAIN}${testURL}`);
      expect(body).toBe(true);

      mockBackend.verify();
    }));

    it('should perform error handling when fail', fakeAsync(() => {
      spyOn(devModeServiceSpy, 'isDevMode').and.returnValue(false);
      spyOn(console, 'error');

      const ERR_MESSAGE = 'Invalid DELETE Request';
      const err = { success: false, status: 400, statusText: 'Bad Request' };
      let res: any;
      let errRes: any;
      service.delete(testURL).subscribe(
        _res => {
          res = _res;
        },
        _err => {
          errRes = _err;
        }
      );
      const req = mockBackend.expectOne({ url: `${SCHEME_DOMAIN}${testURL}`, method: 'DELETE' }).flush(ERR_MESSAGE, err);

      expect(res).toBeUndefined();
      expect(console.error).not.toHaveBeenCalled();
      expect(errRes).toEqual(ERR_MESSAGE);
      mockBackend.verify();
    }));
  });

  describe('setParams()', () => {
    it('should return HttpParams() object if parameter is not empty', () => {
      const httpParam = service.setParams({
        test: true,
        one: 1,
        two: 2,
      });
      expect(httpParam.toString()).toEqual('test=true&one=1&two=2');
    });
  });

  describe('getAppkey()', () => {
    it('should return appkey from RequestConfig class', () => {
      const result = service.getAppkey();
      expect(result).toEqual(APPKEY);
      expect(result).toEqual(requestConfigSpy.appkey);
    });
  });

  describe('apiResponseFormatError()', () => {
    it('should trigger console.error with dynamic message', () => {
      spyOn(console, 'error');

      service.apiResponseFormatError('testing error');
      expect(console.error).toHaveBeenCalledWith('API response format error.\ntesting error');
    });
  });

  describe('handleError()', () => {
    const ERR_MESSAGE = 'Invalid request';
    const err = { success: false, status: 400, statusText: 'Bad Request' };
    let errRes: any;
    let request: any;

    it('should only run console.error on dev mode', () => {
      service.get('', { params: { justFor: 'test' } }).subscribe(
        _res => {
          expect(_res).toBeFalsy();
        },
        _err => {
          errRes = _err;
          expect(errRes).toEqual(ERR_MESSAGE);
        }
      );

      mockBackend.expectOne({ method: 'GET' }).flush(ERR_MESSAGE, err);
      mockBackend.verify();
    });

    it('should logout user on bad apikey', () => {
      const badKey = 'Expired apikey';

      service.get('', { params: { justFor: 'test' } }).subscribe(
        _res => _res,
        _err => {
          errRes = _err;
          expect(errRes.message).toEqual(badKey);
        }
      );

      request = mockBackend.expectOne({ method: 'GET' }).flush({ message: badKey }, err);
      mockBackend.verify();
    });
  });
});
