import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '@v3/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ReviewService } from '@v3/app/services/review.service';
import { of, Subject } from 'rxjs';

import { ReviewDesktopPage } from './review-desktop.page';

describe('ReviewDesktopPage', () => {
  let component: ReviewDesktopPage;
  let assessmentService: jasmine.SpyObj<AssessmentService>;
  let reviewService: jasmine.SpyObj<ReviewService>;
  let notificationsService: jasmine.SpyObj<NotificationsService>;
  let utilsService: jasmine.SpyObj<UtilsService>;

  const createComponent = ({
    submissionId = 1,
    reviews = [] as any[],
    assessment = { id: 99, pulseCheck: false } as any,
    submission = { id: 100, status: 'pending review' } as any,
    review = { id: 101 } as any,
  } = {}) => {
    const paramMap$ = new Subject<any>();
    const params$ = new Subject<any>();

    assessmentService = jasmine.createSpyObj<AssessmentService>('AssessmentService', [
      'getAssessment',
      'fetchAssessment',
      'submitReview',
      'pullFastFeedback'
    ], {
      assessment$: of(assessment),
      submission$: of(submission),
      review$: of(review),
    });

    reviewService = jasmine.createSpyObj<ReviewService>('ReviewService', ['getReviews'], {
      reviews$: of(reviews),
    });

    notificationsService = jasmine.createSpyObj<NotificationsService>('NotificationsService', [
      'getTodoItems',
      'assessmentSubmittedToast'
    ]);
    notificationsService.getTodoItems.and.returnValue(of([]) as any);

    utilsService = jasmine.createSpyObj<UtilsService>('UtilsService', ['setPageTitle', 'isEmpty']);
    utilsService.isEmpty.and.callFake((value) => value === null || value === undefined || value === '');

    const activatedRoute = {
      paramMap: paramMap$.asObservable(),
      params: params$.asObservable(),
    } as ActivatedRoute;

    component = new ReviewDesktopPage(
      utilsService,
      activatedRoute,
      assessmentService,
      reviewService,
      notificationsService,
      { markForCheck: jasmine.createSpy('markForCheck') } as any,
      { run: jasmine.createSpy('ngZoneRun').and.callFake((fn: () => any) => fn()) } as any,
    );

    component.ngOnInit();
    paramMap$.next({});
    params$.next({ submissionId });
  };

  beforeEach(() => {
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark noReview when goto receives undefined review', () => {
    component.goto(undefined as any);

    expect(component.noReview).toBeTrue();
  });

  it('should load assessment when goto receives review', () => {
    const review = { assessmentId: 11, contextId: 22, submissionId: 33, name: 'Review A' } as any;

    component.goto(review);

    expect(component.noReview).toBeFalse();
    expect(component.currentReview).toEqual(review);
    expect(assessmentService.getAssessment).toHaveBeenCalledWith(11, 'review', 0, 22, 33);
  });

  it('should return early in gotoFirstReview when reviews is falsy', () => {
    spyOn(component, 'goto');

    component.gotoFirstReview(undefined as any);

    expect(component.goto).not.toHaveBeenCalled();
  });

  it('should go to matching submission in gotoFirstReview', () => {
    const reviews = [
      { submissionId: 1, isDone: true },
      { submissionId: 2, isDone: false },
    ] as any;
    component.submissionId = 2;
    spyOn(component, 'goto');

    component.gotoFirstReview(reviews);

    expect(component.goto).toHaveBeenCalledWith(reviews[1]);
  });

  it('should go to first not-done review when no submission id', () => {
    const reviews = [
      { submissionId: 1, isDone: true },
      { submissionId: 2, isDone: false },
    ] as any;
    component.submissionId = 0;
    spyOn(component, 'goto');

    component.gotoFirstReview(reviews);

    expect(component.goto).toHaveBeenCalledWith(reviews[1]);
  });

  it('should return early in saveReview when autosave while loading', async () => {
    component.loading = true;
    const event = { autoSave: true };

    await component.saveReview(event as any);

    expect(assessmentService.fetchAssessment).not.toHaveBeenCalled();
  });

  it('should show duplicated toast when submission is not pending review', async () => {
    component.currentReview = { contextId: 2 } as any;
    component.submission = { id: 3, status: 'done' } as any;
    component.review = { id: 4 } as any;
    component.assessment = { id: 5, pulseCheck: false } as any;
    assessmentService.fetchAssessment.and.returnValue(of({ submission: { status: 'done' } }) as any);

    await component.saveReview({ autoSave: false, assessmentId: 5, answers: {} } as any);

    expect(notificationsService.assessmentSubmittedToast).toHaveBeenCalledWith({ isDuplicated: true });
    expect(component.loading).toBeFalse();
  });

  it('should handle submitReview false gracefully', async () => {
    component.currentReview = { contextId: 2 } as any;
    component.submission = { id: 3, status: 'pending review' } as any;
    component.review = { id: 4 } as any;
    component.assessment = { id: 5, pulseCheck: false } as any;
    assessmentService.fetchAssessment.and.returnValues(
      of({ submission: { status: 'pending review' } }) as any,
      of({ submission: { status: 'pending review' } }) as any
    );
    assessmentService.submitReview.and.returnValue(of({ data: { submitReview: false } }) as any);

    await component.saveReview({ autoSave: false, assessmentId: 5, answers: { q1: 'a' } } as any);

    expect(component.savingText$.value).toBe('Save failed.');
    expect(component.btnDisabled$.value).toBeFalse();
    expect(component.loading).toBeFalse();
  });

  it('should trigger pulse check and success toast on successful submit', async () => {
    component.currentReview = { contextId: 2 } as any;
    component.submission = { id: 3, status: 'pending review' } as any;
    component.review = { id: 4 } as any;
    component.assessment = { id: 5, pulseCheck: true } as any;
    assessmentService.fetchAssessment.and.returnValues(
      of({ submission: { status: 'pending review' } }) as any,
      of({ submission: { status: 'done' } }) as any
    );
    assessmentService.submitReview.and.returnValue(of({ data: { submitReview: true } }) as any);
    assessmentService.pullFastFeedback.and.returnValue(Promise.resolve() as any);

    await component.saveReview({ autoSave: false, assessmentId: 5, answers: { q1: 'a' } } as any);

    expect(assessmentService.pullFastFeedback).toHaveBeenCalled();
    expect(reviewService.getReviews).toHaveBeenCalled();
    expect(notificationsService.getTodoItems).toHaveBeenCalled();
    expect(notificationsService.assessmentSubmittedToast).toHaveBeenCalledWith({ isReview: true });
    expect(component.btnDisabled$.value).toBeFalse();
    expect(component.loading).toBeFalse();
  });

  it('should set failure states when saveReview throws', async () => {
    component.currentReview = { contextId: 2 } as any;
    component.submission = { id: 3, status: 'pending review' } as any;
    component.review = { id: 4 } as any;
    component.assessment = { id: 5, pulseCheck: false } as any;
    assessmentService.fetchAssessment.and.returnValue(of({ submission: { status: 'pending review' } }) as any);
    assessmentService.submitReview.and.returnValue(of({
      data: {
        get submitReview() {
          throw new Error('submit error');
        }
      }
    }) as any);

    await component.saveReview({ autoSave: false, assessmentId: 5, answers: {} } as any);

    expect(component.savingText$.value).toBe('Save Failed.');
    expect(component.loading).toBeFalse();
    expect(component.btnDisabled$.value).toBeFalse();
    expect(notificationsService.assessmentSubmittedToast).toHaveBeenCalledWith({ isFail: true });
  });
});
