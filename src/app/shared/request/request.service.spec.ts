import { isDevMode, enableProdMode } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  inject,
  fakeAsync,
  tick,
  TestBed,
  async,
} from '@angular/core/testing';

import {
  MockBackend,
} from '@angular/http/testing';

import {
  HttpClient,
  HttpRequest,
  HttpHeaders
} from '@angular/common/http';

import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';

import {
  Http,
  ConnectionBackend,
  BaseRequestOptions,
  Response,
  ResponseOptions
} from '@angular/http';

import { RequestService, RequestConfig, DevModeService, QueryEncoder } from './request.service';
import { Router } from '@angular/router';
import { BrowserStorageService } from '@services/storage.service';
import { TestUtils } from '@testing/utils';
import { BrowserStorageServiceMock } from '@testing/mocked.service';

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
          provide: RequestConfig,
          useValue: {
            appkey: APPKEY,
            prefixUrl: PREFIX_URL,
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
    const testURL = 'https://www.test.com';

    it('should perform a GET request based on provided URL', fakeAsync(() => {
      let res = { body: true };

      /*httpMock.connections.subscribe(con => {
        expect(con.request.url).toBe(testURL);
        const response = new ResponseOptions(res);
        con.mockRespond(new Response(response));
      });
*/
      service.get(testURL, {param: {justFor: 'test'}}).subscribe(_res => {
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
      service.get(testURL, {header: {some: 'keys'}}).subscribe(_res => {
        res = _res;
      });
      const req = mockBackend.expectOne({ method: 'GET' });
      req.flush(res);

      expect(storageSpy.setUser).toHaveBeenCalledWith({apikey: res.apikey});
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
      const req = mockBackend.expectOne({ url: testURL, method: 'GET'}).flush(ERR_MESSAGE, err);

      expect(res).toBeUndefined();
      expect(errRes).toEqual(ERR_MESSAGE);
    }));
  });

  describe('post()', () => {
    const testURL = 'https://www.post-test.com';
    const sampleData = {
      sample: 'data'
    };

    it('should perform a GET request based on provided URL', fakeAsync(() => {
      let res = { body: true };

      service.post(testURL, sampleData).subscribe(_res => {
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

    it('should perform error handling when fail', fakeAsync(() => {
      spyOn(devModeServiceSpy, 'isDevMode').and.returnValue(false);

      const ERR_MESSAGE = 'Invalid POST Request';
      const err = { success: false, status: 400, statusText: 'Bad Request' };
      let res: any;
      let errRes: any;
      service.post(testURL, sampleData).subscribe(
        _res => {
          res = _res;
        },
        _err => {
          errRes = _err;
        }
      );
      const req = mockBackend.expectOne({ url: testURL, method: 'POST'}).flush(ERR_MESSAGE, err);

      expect(res).toBeUndefined();
      expect(errRes).toEqual(ERR_MESSAGE);
    }));
  });

  describe('delete()', () => {
    const testURL = 'https://www.delete-test.com';

    it('should perform a GET request based on provided URL', fakeAsync(() => {
      let res = { body: true };

      service.delete(testURL).subscribe(_res => {
        res = _res;
      });
      const req = mockBackend.expectOne({ method: 'DELETE' });
      req.flush(res);

      tick();

      const { body } = res;
      expect(req.request.url).toBe(testURL);
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
      const req = mockBackend.expectOne({ url: testURL, method: 'DELETE'}).flush(ERR_MESSAGE, err);

      expect(res).toBeUndefined();
      expect(console.error).not.toHaveBeenCalled();
      expect(errRes).toEqual(ERR_MESSAGE);
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

  describe('getPrefixUrl()', () => {
    it('should return prefixUrl from RequestConfig class', () => {
      const result = service.getPrefixUrl();
      expect(result).toEqual(PREFIX_URL);
      expect(result).toEqual(requestConfigSpy.prefixUrl);
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
    beforeEach(fakeAsync(() => {
      request = service.get('test.com').subscribe(
        _res => _res,
        _err => {
          errRes = _err;
        }
      );
    }));

    it('should only run console.error on dev mode', () => {
      spyOn(devModeServiceSpy, 'isDevMode').and.returnValue(true);
      spyOn(console, 'error');

      mockBackend.expectOne({ method: 'GET'}).flush(ERR_MESSAGE, err);
      expect(devModeServiceSpy.isDevMode).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(devModeServiceSpy.isDevMode()).toBeTruthy();
      expect(errRes).toEqual(ERR_MESSAGE);
    });

    it('should logout user on bad apikey', fakeAsync(() => {
      const badKey = 'Expired apikey';
      mockBackend.expectOne({ method: 'GET'}).flush({message: badKey}, err);
      expect(service['loggedOut']).toBeTruthy();
      tick(2000);
      expect(service['loggedOut']).toEqual(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['logout']);
    }));

    it('should throw error if static file retrival fail', fakeAsync(() => {
      mockBackend.expectOne({ method: 'GET'}).flush('<!DOCTYPE html>', err);
      expect(errRes).toEqual('Http failure response for test.comtest.com: 400 Bad Request');
    }));
  });
});
