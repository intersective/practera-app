import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RequestService } from './request.service';
import { RequestInterceptor } from './request.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

describe('RequestInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RequestService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: RequestInterceptor,
          multi: true,
        }
      ]
    })
  });

  it('should has Authentication injected into HTTP header', () => {

  });
});
