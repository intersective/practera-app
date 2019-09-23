import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RequestModule } from './request.module';
import { RequestService } from './request.service';
import { RequestInterceptor } from './request.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { asyncData } from '@testing/async-observable-helpers';

import { Router } from '@angular/router';
import { TestUtils } from '@testing/utils';

describe('RequestInterceptor', () => {
  const APPKEY = 'TEST';
  const routerSpy = TestUtils.createRouterSpy();
  let service: RequestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RequestModule.forRoot({
          appkey: APPKEY,
          prefixUrl: 'test.com'
        })
      ],
      providers: [
        RequestService,
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: RequestInterceptor,
          multi: true,
        }
      ]
    });

    service = TestBed.get(RequestService);
    httpMock = TestBed.get(HttpTestingController);
  });

  beforeEach(fakeAsync(() => {
    service.get('/test').subscribe(_res => {
      expect(_res).toBeTruthy();
    });
    tick();
  }));

  it('should has Authentication injected into HTTP header', () => {
    const req = httpMock.expectOne({ method: 'GET' });
    expect(req.request.headers.has('appkey')).toEqual(true);
  });

  it('should return APPKEY as provided in RequestConfig', () => {
    const req = httpMock.expectOne({ method: 'GET' });
    expect(req.request.headers.get('appkey')).toBe(APPKEY);
  });
});
