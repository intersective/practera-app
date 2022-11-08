import { TestBed } from '@angular/core/testing';
import { OverviewService } from './overview.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { TestUtils } from '@testing/utils';
import { Apollo } from 'apollo-angular';

describe('OverviewService', () => {
  let service: OverviewService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Apollo,
        UtilsService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'graphQLWatch'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: {
              projectId: 1
            },
            set : true
          })
        },
      ]
    });
    service = TestBed.inject(OverviewService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    utils = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('when testing getProject(), should return correct data', () => {
    const response = {
      success: true,
      data: {
        project: {
          progress: 0.26,
          milestones: Array.from({length: 5}, (x, i) => {
            return {
              id: i + 1,
              progress: 0.17,
              activities: Array.from({length: 3}, (y, j) => {
                return {
                  id: i * 10 + j + 1,
                  progress: 0.13
                };
              })
            };
          })
        }
      }
    };
    const expected = {
      project: {
        progress: 0.26,
        milestones: Array.from({length: 5}, (x, i) => {
          return {
            id: i + 1,
            progress: 0.17,
            activities: Array.from({length: 3}, (y, j) => {
              return {
                id: i * 10 + j + 1,
                progress: 0.13
              };
            })
          };
        })
      }
    };
    requestSpy.graphQLWatch.and.returnValue(of(response));
    service.getProgress().subscribe(progress => expect(progress).toEqual(expected));
  });
});
