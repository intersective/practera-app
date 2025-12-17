import { TestBed } from '@angular/core/testing';
import { FastFeedbackService } from './fast-feedback.service';
import { of, throwError } from 'rxjs';
import { TestUtils } from '@testingv3/utils';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { ApolloService } from './apollo.service';
import { DemoService } from './demo.service';
import { AlertController } from '@ionic/angular';
import { Injector } from '@angular/core';

describe('FastFeedbackService', () => {
  let service: FastFeedbackService;
  let apolloSpy: jasmine.SpyObj<ApolloService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let storageSpy: jasmine.SpyObj<BrowserStorageService>;
  const testUtils = new TestUtils();

  beforeEach(() => {
    apolloSpy = jasmine.createSpyObj('ApolloService', ['graphQLFetch', 'graphQLWatch']);
    TestBed.configureTestingModule({
      providers: [
        FastFeedbackService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: ApolloService,
          useValue: apolloSpy,
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['modal', 'fastFeedbackModal'])
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['set', 'get', 'getUser'])
        },
        {
          provide: DemoService,
          useValue: jasmine.createSpyObj('DemoService', ['fastFeedback', 'normalResponse'])
        },
        {
          provide: AlertController,
          useValue: jasmine.createSpyObj('AlertController', ['create'])
        }
      ]
    });
    service = TestBed.inject(FastFeedbackService);
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get fastfeedback from API', () => {
    apolloSpy.graphQLFetch.and.returnValue(of({}));
    service["_getFastFeedback"]().subscribe();
    expect(apolloSpy.graphQLFetch.calls.count()).toBe(1);
  });

  /*it('should open fastfeedback modal', () => {
    service.fastFeedbackModal();
    expect(notificationSpy.modal.calls.count()).toBe(1);
  });*/

  describe('when testing pullFastFeedback()', () => {
    it('should pop up modal', () => {
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: {
          pulseCheck: {
            questions: [{ id: 1, name: 'Question 1', choices: [] }],
            meta: {
              teamId: 1,
              teamName: 'Team 1'
            }
          }
        }
      }));
      storageSpy.get.and.returnValue(false);
      service.pullFastFeedback().subscribe(res => {
        expect(storageSpy.set.calls.count()).toBe(1);
        expect(notificationSpy.fastFeedbackModal.calls.count()).toBe(1);
      });
    });

    it('should not pop up modal when slider object length is 0', () => {
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: {
          pulseCheck: {
            questions: [],
            meta: {}
          }
        }
      }));
      storageSpy.get.and.returnValue(false);
      service.pullFastFeedback().subscribe(res => {
        expect(storageSpy.set.calls.count()).toBe(0);
        expect(notificationSpy.fastFeedbackModal.calls.count()).toBe(0);
      });
    });

    it('should not pop up modal when get storage returns false', () => {
      apolloSpy.graphQLFetch.and.returnValue(throwError(() => new Error('error')));
      storageSpy.get.and.returnValue(false);
      service.pullFastFeedback().subscribe({
        next: res => {
          expect(storageSpy.set.calls.count()).toBe(0);
          expect(notificationSpy.fastFeedbackModal.calls.count()).toBe(0);
        },
        error: () => {}
      });
    });

    it('should not popup modal when slider & meta are not available', () => {
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: {
          pulseCheck: null
        }
      }));

      service.pullFastFeedback().subscribe(res => {
        expect(notificationSpy.fastFeedbackModal).not.toHaveBeenCalled();
      });
    });

    it('should not popup modal when slider is not available', () => {
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: {
          pulseCheck: {
            questions: [],
            meta: { teamId: 1 },
          }
        }
      }));

      service.pullFastFeedback().subscribe(res => {
        expect(notificationSpy.fastFeedbackModal).not.toHaveBeenCalled();
      });
    });

    it('should not popup modal when meta is not available', () => {
      apolloSpy.graphQLFetch.and.returnValue(of({
        data: {
          pulseCheck: {
            questions: [{ id: 1, name: 'Q1', choices: [] }],
            meta: undefined,
          }
        }
      }));

      service.pullFastFeedback().subscribe(res => {
        expect(notificationSpy.fastFeedbackModal).not.toHaveBeenCalled();
      });
    });
  });


});
