import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';
import { TestUtils } from '@testing/utils';

describe('ProjectService', () => {
  let service: ProjectService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectService,
        UtilsService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
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
    service = TestBed.get(ProjectService);
    requestSpy = TestBed.get(RequestService);
    utils = TestBed.get(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getMilestones()', () => {
    const response = {
      success: true,
      data: Array.from({length: 5}, (x, i) => {
        return {
          id: i + 1,
          name: 'name' + i,
          description: 'des' + i,
          is_locked: i > 3
        };
      })
    };
    describe('it should throw', () => {
      let tmpResponse, errMsg;
      beforeEach(() => {
        tmpResponse = JSON.parse(JSON.stringify(response));
      });
      afterEach(() => {
        requestSpy.get.and.returnValue(of(tmpResponse));
        service.getMilestones().subscribe();
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
        expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual(errMsg);
      });
      it('Milestones array format error', () => {
        tmpResponse.data = {};
        errMsg = 'Milestones array format error';
      });
      it('Milestone format error', () => {
        tmpResponse.data[1] = {id: 2};
        errMsg = 'Milestone format error';
      });
    });

    it('should return correct data', () => {
      requestSpy.get.and.returnValue(of(response));
      service.getMilestones().subscribe(milestones => {
        expect(milestones).toEqual(Array.from({length: 5}, (x, i) => {
          return {
            id: i + 1,
            name: 'name' + i,
            description: 'des' + i,
            isLocked: i > 3,
            progress: 0,
            Activity: [{ dummy: true }]
          };
        }));
      });
    });
  });

  describe('when testing getActivities()', () => {
    const milestones = Array.from({length: 5}, (x, i) => {
      return {
        id: i + 1,
        isLocked: i > 3
      };
    });
    const response = {
      success: true,
      data: Array.from({length: 5}, (x, i) => {
        return {
          Activity: {
            id: i + 1,
            name: 'name' + i,
            milestone_id: i + 1,
            is_locked: i > 3,
            lead_image: ''
          }
        };
      })
    };
    describe('it should throw', () => {
      let tmpResponse, errMsg;
      beforeEach(() => {
        tmpResponse = JSON.parse(JSON.stringify(response));
      });
      afterEach(() => {
        requestSpy.get.and.returnValue(of(tmpResponse));
        service.getActivities(milestones).subscribe();
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
        expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual(errMsg);
      });
      it('Activities array format error', () => {
        tmpResponse.data = {};
        errMsg = 'Activities array format error';
      });
      it('Activity.Activity format error', () => {
        tmpResponse.data[1].Activity = {id: 2};
        errMsg = 'Activity.Activity format error';
      });
    });

    it('should return correct data', () => {
      requestSpy.get.and.returnValue(of(response));
      service.getActivities(milestones).subscribe(activities => {
        expect(activities).toEqual(Array.from({length: 5}, (x, i) => {
          return {
            id: i + 1,
            name: 'name' + i,
            milestoneId: i + 1,
            isLocked: i > 3,
            leadImage: '',
            progress: 0
          };
        }));
      });
      expect(requestSpy.get.calls.first().args[1]).toEqual({
        params: {milestone_id: JSON.stringify([1, 2, 3, 4])}
      });
    });
  });

  describe('when testing getProgress()', () => {
    const response = {
      success: true,
      data: {
        Project: {
          progress: 1,
          Milestone: [{
            id: 1,
            progress: 1
          }]
        }
      }
    };
    it('should throw Progress format error', () => {
      const tmpResponse = JSON.parse(JSON.stringify(response));
      tmpResponse.data = {};
      requestSpy.get.and.returnValue(of(tmpResponse));
      service.getProgress().subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
      expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual('Progress format error');
    });
    it('should return correct data', () => {
      requestSpy.get.and.returnValue(of(response));
      service.getProgress().subscribe(res => expect(res).toEqual(response.data.Project));
    });
  });

  it('when testing getOverview(), it should return correct data', () => {
    const response = {id: 2};
    requestSpy.get.and.returnValue(of(response));
    service.getOverview().subscribe(res => expect(res).toEqual(response));
  });
});
