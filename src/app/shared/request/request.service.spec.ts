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

import { RequestService } from './request.service';
import { Router } from '@angular/router';
import { TestUtils } from '@testing/utils';

describe('RequestService', () => {
  const routerSpy = TestUtils.createRouterSpy();

  let service: RequestService;
  let mockBackend: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RequestService,
        {
          provide: Router,
          useValue: routerSpy
        }
      ]
    });

    service = TestBed.get(RequestService);
    mockBackend = TestBed.get(HttpTestingController);
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
      })
    );
  });
});
