import { TestBed } from '@angular/core/testing';
import { ActivityService, Overview } from './activity.service';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';

describe('ActivityService', () => {
  let service: ActivityService;
  let requestSpy: jasmine.SpyObj<RequestService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ActivityService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        },
      ]
    });
    service = TestBed.get(ActivityService);
    requestSpy = TestBed.get(RequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getActivity()', () => {
    const requestResponse = {
      success: true,
      data: [
        {
          Activity: {
            id: 1,
            name: 'activity',
            description: 'des'
          },
          ActivitySequence: [
            {
              is_locked: true
            },
            {
              model: 'Story.Topic',
              'Story.Topic': {
                id: 11,
                title: 'topic 11'
              }
            },
            {
              model: 'Assess.Assessment',
              'Assess.Assessment': {
                id: 21,
                name: 'asmt 21',
                is_team: false,
                deadline: '2019-02-02'
              }
            }
          ],
          References: [
            {
              Assessment: {
                id: 21
              },
              context_id: 211
            }
          ]
        }
      ]
    };
    const activity = requestResponse.data[0];
    const expected = {
      id: activity.Activity.id,
      name: activity.Activity.name,
      description: activity.Activity.description,
      tasks: [
        {
          id: 0,
          type: 'Locked',
          name: 'Locked',
          loadingStatus: false
        },
        {
          id: 11,
          type: 'Topic',
          name: requestResponse.data[0].ActivitySequence[1]['Story.Topic'].title,
          loadingStatus: true
        },
        {
          id: 21,
          type: 'Assessment',
          name: requestResponse.data[0].ActivitySequence[2]['Assess.Assessment'].name,
          contextId: 211,
          isForTeam: requestResponse.data[0].ActivitySequence[2]['Assess.Assessment'].is_team,
          dueDate: requestResponse.data[0].ActivitySequence[2]['Assess.Assessment'].deadline,
          isOverdue: true,
          isDueToday: false,
          loadingStatus: true
        }
      ]
    };

    it('should throw format error #1', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getActivity(1).subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
      expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual('Activity format error');
    });

    it('should throw format error #2', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0].ActivitySequence[1] = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getActivity(1).subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
      expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual('Activity.ActivitySequence format error');
    });

    it('should get the correct data', () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getActivity(1).subscribe(res => expect(res).toEqual(expected));
    });
  });

  describe('when testing getAssessmentStatus()', () => {
    const requestResponse = {
      success: true,
      data: [
        {
          AssessmentSubmission: {
            is_locked: false,
            status: 'in progress'
          },
          Submitter: {
            name: 'submitter',
            image: 'image'
          }
        }
      ]
    };
    const task = {
      id: 1,
      name: 'name',
      type: 'Assessment',
      progress: 0
    };
    const expected = {
      id: task.id,
      name: task.name,
      type: task.type,
      progress: 0,
      isLocked: requestResponse.data[0].AssessmentSubmission.is_locked,
      submitter: {
        name: requestResponse.data[0].Submitter.name,
        image: requestResponse.data[0].Submitter.image
      },
      status: 'in progress',
      loadingStatus: false
    };

    it('should return empty status', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data = [];
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessmentStatus(task).subscribe(res => expect(res).toEqual({
        id: task.id,
        name: task.name,
        type: task.type,
        status: '',
        progress: 0,
        loadingStatus: false
      }));
    });

    it('should throw format error', () => {
      const tmpRes = JSON.parse(JSON.stringify(requestResponse));
      tmpRes.data[0] = {};
      requestSpy.get.and.returnValue(of(tmpRes));
      service.getAssessmentStatus(task).subscribe();
      expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
    });

    describe('should return correct data', () => {
      let tmpRes;
      let tmpExpected;
      let tmpTask;
      beforeEach(() => {
        tmpRes = JSON.parse(JSON.stringify(requestResponse));
        tmpTask = JSON.parse(JSON.stringify(task));
        tmpExpected = JSON.parse(JSON.stringify(expected));
      });
      afterEach(() => {
        requestSpy.get.and.returnValue(of(tmpRes));
        service.getAssessmentStatus(tmpTask).subscribe(res => expect(res).toEqual(tmpExpected));
      });

      it('#1', () => {
        // don't need to change anything
      });
      it('#2', () => {
        tmpRes.data[0].AssessmentSubmission.status = 'pending approval';
        tmpExpected.status = 'pending review';
      });
      it('#3', () => {
        tmpRes.data[0].AssessmentSubmission.status = 'pending review';
        tmpExpected.status = 'pending review';
      });
      it('#4', () => {
        tmpRes.data[0].AssessmentSubmission.status = 'published';
        tmpExpected.status = 'feedback available';
        tmpExpected.feedbackReviewed = false;
      });
      it('#5', () => {
        tmpRes.data[0].AssessmentSubmission.status = 'published';
        tmpExpected.status = 'done';
        tmpTask.progress = 1;
        tmpExpected.progress = 1;
        tmpExpected.feedbackReviewed = true;
      });
      it('#6', () => {
        tmpRes.data[0].AssessmentSubmission.status = 'done';
        tmpExpected.status = 'done';
      });
    });
  });

  describe('when testing getTasksProgress()', () => {
    const options = {
      model_id: 1,
      tasks: [
        {
          id: 11,
          type: 'Topic',
          name: 'topic 11'
        },
        {
          id: 12,
          type: 'Topic',
          name: 'topic 12'
        },
        {
          id: 13,
          type: 'Topic',
          name: 'topic 13'
        },
        {
          id: 21,
          type: 'Assessment',
          name: 'asmt 21'
        },
        {
          id: 22,
          type: 'Assessment',
          name: 'asmt 21'
        }
      ]
    };
    const requestResponse = {
      success: true,
      data: {
        Activity: {
          Topic: [
            {
              id: 11,
              progress: 0
            },
            {
              id: 12,
              progress: 1
            }
          ],
          Assessment: [
            {
              id: 21,
              progress: 1
            }
          ]
        }
      }
    };
    const expected = [
      {
        id: options.tasks[0].id,
        type: options.tasks[0].type,
        name: options.tasks[0].name,
        progress: requestResponse.data.Activity.Topic[0].progress,
        status: '',
        loadingStatus: false
      },
      {
        id: options.tasks[1].id,
        type: options.tasks[1].type,
        name: options.tasks[1].name,
        progress: requestResponse.data.Activity.Topic[1].progress,
        status: 'done',
        loadingStatus: false
      },
      {
        id: options.tasks[2].id,
        type: options.tasks[2].type,
        name: options.tasks[2].name,
        progress: 0,
        status: '',
        loadingStatus: false
      },
      {
        id: options.tasks[3].id,
        type: options.tasks[3].type,
        name: options.tasks[3].name,
        progress: requestResponse.data.Activity.Assessment[0].progress
      },
      {
        id: options.tasks[4].id,
        type: options.tasks[4].type,
        name: options.tasks[4].name,
        progress: 0
      }
    ];

    describe('should throw format error', () => {
      let tmpRes;
      let tmpExpected;
      let tmpOptions;
      let errMsg;
      beforeEach(() => {
        tmpRes = JSON.parse(JSON.stringify(requestResponse));
        tmpOptions = JSON.parse(JSON.stringify(options));
        tmpExpected = JSON.parse(JSON.stringify(expected));
      });
      afterEach(() => {
        requestSpy.get.and.returnValue(of(tmpRes));
        service.getTasksProgress(tmpOptions).subscribe();
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
        expect(requestSpy.apiResponseFormatError.calls.first().args[0]).toEqual(errMsg);
      });

      it('Progress.Activity format error', () => {
        tmpRes.data = {};
        errMsg = 'Progress.Activity format error';
      });
      it('Progress.Activity.Topic format error', () => {
        tmpRes.data.Activity.Topic[0] = {id: 11};
        errMsg = 'Progress.Activity.Topic format error';
      });
      it('Progress.Activity.Assessment format error', () => {
        tmpRes.data.Activity.Assessment[0] = {id: 21};
        errMsg = 'Progress.Activity.Assessment format error';
      });
    });

    it('should get correct data', () => {
      requestSpy.get.and.returnValue(of(requestResponse));
      service.getTasksProgress(options).subscribe(res => expect(res).toEqual(expected));
    });

  });

});
