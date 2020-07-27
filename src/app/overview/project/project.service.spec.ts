import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { TestUtils } from '@testing/utils';
import { Apollo } from 'apollo-angular';

describe('ProjectService', () => {
  let service: ProjectService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Apollo,
        UtilsService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'graphQLQuery'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: {
              projectId: 1
            }
          })
        },
      ]
    });
    service = TestBed.inject(ProjectService);
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
        milestones: Array.from({length: 5}, (x, i) => {
          return {
            id: i + 1,
            name: 'm' + i,
            description: 'des' + i,
            isLocked: false,
            progress: (i + 1) / 10,
            activities: Array.from({length: 3}, (y, j) => {
              return {
                id: i * 10 + j + 1,
                name: 'activity name' + j,
                isLocked: false,
                leadImage: '',
                progress: (i * 10 + j + 1) / 100,
              };
            })
          };
        })
      }
    };
    const expected = Array.from({length: 5}, (x, i) => {
      return {
        id: i + 1,
        name: 'm' + i,
        description: 'des' + i,
        isLocked: false,
        progress: (i + 1) / 10,
        Activity: Array.from({length: 3}, (y, j) => {
          return {
            id: i * 10 + j + 1,
            name: 'activity name' + j,
            isLocked: false,
            leadImage: '',
            progress: (i * 10 + j + 1) / 100,
          };
        })
      };
    });
    requestSpy.graphQLQuery.and.returnValue(of(response));
    service.getProject().subscribe(milestones => expect(milestones).toEqual(expected));
  });
});
