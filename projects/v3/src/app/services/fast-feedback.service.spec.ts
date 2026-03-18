import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FastFeedbackService } from './fast-feedback.service';
import { of } from 'rxjs';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { DemoService } from './demo.service';
import { ApolloService } from './apollo.service';
import { AlertController } from '@ionic/angular';

// helper to build a valid pulse check API response
function makePulseCheckResponse(questions: any[] = [], meta: any = null) {
  return {
    data: {
      pulseCheck: {
        questions,
        meta,
      }
    }
  };
}

const VALID_QUESTIONS = [
  { id: 7, name: 'Q1', choices: [{ id: 1, name: 'Yes' }, { id: 2, name: 'No' }] },
  { id: 8, name: 'Q2', choices: [{ id: 3, name: 'Yes' }, { id: 4, name: 'No' }] },
];

const VALID_META = { teamId: 100, teamName: 'Team A', contextId: 200 };

describe('FastFeedbackService', () => {
  let service: FastFeedbackService;
  let apolloSpy: jasmine.SpyObj<ApolloService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FastFeedbackService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', {
            graphQLFetch: of({}),
            graphQLMutate: of({}),
          }),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', {
            fastFeedbackModal: Promise.resolve(),
          }),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['set', 'get']),
        },
        {
          provide: DemoService,
          useValue: jasmine.createSpyObj('DemoService', ['fastFeedback', 'normalResponse']),
        },
        {
          provide: AlertController,
          useValue: jasmine.createSpyObj('AlertController', ['create']),
        },
      ]
    });
    service = TestBed.inject(FastFeedbackService);
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch pulse check data from API', () => {
    apolloSpy.graphQLFetch.and.returnValue(of({}));
    service['_getFastFeedback']().subscribe();
    expect(apolloSpy.graphQLFetch).toHaveBeenCalledTimes(1);
  });

  describe('when testing pullFastFeedback()', () => {
    it('should open modal and set lock when pulse check data is valid', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(makePulseCheckResponse(VALID_QUESTIONS, VALID_META)));
      storageSpy.get.and.returnValue(false);

      service.pullFastFeedback().subscribe(() => {
        expect(storageSpy.set).toHaveBeenCalledWith('fastFeedbackOpening', true);
        expect(notificationSpy.fastFeedbackModal).toHaveBeenCalledTimes(1);
      });
    });

    it('should NOT release the lock after modal is opened (fire-and-forget)', fakeAsync(() => {
      apolloSpy.graphQLFetch.and.returnValue(of(makePulseCheckResponse(VALID_QUESTIONS, VALID_META)));
      storageSpy.get.and.returnValue(false);

      service.pullFastFeedback().subscribe();
      tick();

      const setCalls = storageSpy.set.calls.allArgs();
      const lockCalls = setCalls.filter(args => args[0] === 'fastFeedbackOpening');
      expect(lockCalls.length).toBe(1);
      expect(lockCalls[0]).toEqual(['fastFeedbackOpening', true]);
    }));

    it('should not open modal when fastFeedbackOpening is already true', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(makePulseCheckResponse(VALID_QUESTIONS, VALID_META)));
      storageSpy.get.and.returnValue(true);

      service.pullFastFeedback().subscribe(() => {
        expect(notificationSpy.fastFeedbackModal).not.toHaveBeenCalled();
      });
    });

    it('should not open modal when pulseCheck data is empty', () => {
      apolloSpy.graphQLFetch.and.returnValue(of({ data: { pulseCheck: null } }));
      storageSpy.get.and.returnValue(false);

      service.pullFastFeedback().subscribe(() => {
        expect(notificationSpy.fastFeedbackModal).not.toHaveBeenCalled();
      });
    });

    it('should not open modal when questions are empty', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(makePulseCheckResponse([], VALID_META)));
      storageSpy.get.and.returnValue(false);

      service.pullFastFeedback().subscribe(() => {
        expect(notificationSpy.fastFeedbackModal).not.toHaveBeenCalled();
      });
    });

    it('should not open modal when meta is empty', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(makePulseCheckResponse(VALID_QUESTIONS, null)));
      storageSpy.get.and.returnValue(false);

      service.pullFastFeedback().subscribe(() => {
        expect(notificationSpy.fastFeedbackModal).not.toHaveBeenCalled();
      });
    });

    it('should release lock on modal open error', fakeAsync(() => {
      apolloSpy.graphQLFetch.and.returnValue(of(makePulseCheckResponse(VALID_QUESTIONS, VALID_META)));
      storageSpy.get.and.returnValue(false);
      notificationSpy.fastFeedbackModal.and.returnValue(Promise.reject('modal error'));

      service.pullFastFeedback().subscribe();
      tick();

      const setCalls = storageSpy.set.calls.allArgs();
      const lockCalls = setCalls.filter(args => args[0] === 'fastFeedbackOpening');
      expect(lockCalls).toEqual([
        ['fastFeedbackOpening', true],
        ['fastFeedbackOpening', false],
      ]);
    }));
  });

  describe('when testing submit()', () => {
    it('should call graphQLMutate with answers and params', () => {
      const answers = [{ questionId: 7, choiceId: 1 }];
      const params = { teamId: 100, contextId: 200 };
      apolloSpy.graphQLMutate.and.returnValue(of({ data: { submitPulseCheck: true } }));

      service.submit(answers, params).subscribe(() => {
        expect(apolloSpy.graphQLMutate).toHaveBeenCalledTimes(1);
      });
    });
  });
});
