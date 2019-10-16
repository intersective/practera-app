import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { Observable, of, pipe } from 'rxjs';
import { PusherService, PusherConfig } from '@shared/pusher/pusher.service';
import { BrowserStorageService } from '@services/storage.service';
import { HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { MockRouter } from '@testing/mocked.service';
fdescribe('PusherService', () => {
  let service: PusherService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      providers: [
        PusherService,
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: {
              timelineId: 1,
              apikey: 'apikey'
            }
          })
        },
        {
          provide: PusherConfig,
          useValue: {
            pusherKey: 'pusherkey',
            apiurl: 'apiurl'
          }
        }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(PusherService);
  });

  it('should create', () => {
    expect(service).toBeDefined();
  });

  describe('when testing initialise()', () => {
    it('should initialise pusher', fakeAsync(() => {
      service.appkey = 'appkey';
      service.initialise();
      tick();
    }));
  });
  it('should disconnect()', () => {
    service.disconnect();
  });

});

