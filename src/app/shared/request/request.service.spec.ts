import {
  inject,
  fakeAsync,
  tick,
  TestBed,
  async
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

import { RequestService, RequestConfig } from './request.service';
import { Router } from '@angular/router';
import { TestUtils } from '@testing/utils';

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

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RequestService,
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
      ]
    });

    service = TestBed.get(RequestService);
    mockBackend = TestBed.get(HttpTestingController);
    requestConfigSpy = TestBed.get(RequestConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should perform a GET request based on provided URL', fakeAsync(() => {
      let res = { body: true };

      const testURL = 'https://www.test.com';
      /*httpMock.connections.subscribe(con => {
        expect(con.request.url).toBe(testURL);
        const response = new ResponseOptions(res);
        con.mockRespond(new Response(response));
      });
*/
      service.get(testURL).subscribe(_res => {
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
  });

  describe('post()', () => {
    it('should perform a GET request based on provided URL', fakeAsync(() => {
        let res = { body: true };

        const testURL = 'https://www.post-test.com';
        const sampleData = {
          sample: 'data'
        };

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
      })
    );
  });

  describe('delete()', () => {
    it('should perform a GET request based on provided URL', fakeAsync(() => {
      let res = { body: true };

      const testURL = 'https://www.delete-test.com';

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
});
