import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RequestModule } from './request.module';
import { RequestService } from './request.service';
import { RequestInterceptor } from './request.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { asyncData } from '@testing/async-observable-helpers';
import { BrowserStorageService } from '@services/storage.service';

import { Router } from '@angular/router';
import { TestUtils } from '@testing/utils';
import { BrowserStorageServiceMock } from '@testing/mocked.service';
import { Apollo } from 'apollo-angular';

describe('RequestInterceptor', () => {
  const APPKEY = 'TEST';
  const routerSpy = TestUtils.createRouterSpy();
  let service: RequestService;
  let httpMock: HttpTestingController;
  let storageSpy: BrowserStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RequestModule.forRoot({
          appkey: APPKEY,
          prefixUrl: 'test.com',
          loginApi: 'login.com'
        })
      ],
      providers: [
        Apollo,
        RequestService,
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: RequestInterceptor,
          multi: true,
        },
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock
        }
      ]
    });

    service = TestBed.inject(RequestService);
    httpMock = TestBed.inject(HttpTestingController);
    storageSpy = TestBed.inject(BrowserStorageService);
  });

  beforeEach(fakeAsync(() => {
    storageSpy.stackConfig = {
      uuid: '12345',
      name: 'Practera Classic App - Stage',
      description: 'Participate in an experience as a learner or reviewer - Testing',
      image: 'https://media.intersective.com/img/learners_reviewers.png',
      url: 'https://test.com',
      type: 'app',
      coreApi: 'https://test.com',
      coreGraphQLApi: 'https://test.com',
      chatApi: 'https://test.com',
      filestack: {
        s3Config: {
          container: 'files.p1-stage.practera.com',
          region: 'ap-southeast-2'
        },
      },
      defaultCountryModel: 'AUS',
      lastLogin: 1619660600368
    };
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

  it('should return appkey & apikey & timelineId as provided in RequestConfig', () => {
    const req = httpMock.expectOne({ method: 'GET' });
    expect(req.request.headers.get('appkey')).toBe(APPKEY);
  });

  it('should return teamid when it\'s not in chat-related & team-list page view', fakeAsync(() => {
    const req = httpMock.expectOne({ method: 'GET' });
    req.flush({});

    expect(storageSpy.getUser).toHaveBeenCalled();
    expect(req.request.url).not.toContain('/message/chat/list.json');
    expect(req.request.url).not.toContain('/message/chat/create_message');
    expect(req.request.url).not.toContain('/message/chat/edit_message');
    expect(req.request.url).not.toContain('/message/chat/list_messages.json');
    expect(req.request.url).not.toContain('/teams.json');
    expect(req.request.headers.get('teamId')).toBe('test');
  }));

  it('should not return teamId when url contains teams.json', fakeAsync(() => {
    service.get('/teams.json').subscribe(_res => {
      expect(_res).toBeTruthy();
    });
    tick();

    const req = httpMock.expectOne({
      url: 'https://test.com/teams.json',
      method: 'GET'
    });

    expect(req.request.url).toContain('/teams.json');
    expect(req.request.headers.get('teamId')).toBe(null);
  }));

  it('should not return appkey when url contains /login (login API Url)', fakeAsync(() => {
    service.get('/login').subscribe(_res => {
      expect(_res).toBeTruthy();
    });
    tick();

    const req = httpMock.expectOne({
      url: 'https://test.com/login',
      method: 'GET'
    });

    expect(req.request.url).toContain('/login');
    expect(req.request.headers.get('appkey')).toBe(null);
  }));

});
