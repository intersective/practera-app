import { TestBed } from '@angular/core/testing';
import { TestUtils } from '@testingv3/utils';
import { RequestService } from 'request';
import { ApolloService } from './apollo.service';
import { DemoService } from './demo.service';
import { EventService } from './event.service';

import { ExperienceService } from './experience.service';
import { HomeService } from './home.service';
import { ReviewService } from './review.service';
import { SharedService } from './shared.service';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';

describe('ExperienceService', () => {
  let service: ExperienceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DemoService,
          useValue: {},
        },
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['']),
        },
        {
          provide: SharedService,
          useValue: jasmine.createSpyObj('SharedService', ['']),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['']),
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['']),
        },
        {
          provide: EventService,
          useValue: jasmine.createSpyObj('EventService', ['']),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', ['']),
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', ['']),
        },
      ],
    });
    service = TestBed.inject(ExperienceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
