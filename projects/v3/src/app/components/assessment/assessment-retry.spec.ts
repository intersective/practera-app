import { signal, SimpleChange } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { AssessmentComponent } from './assessment.component';

describe('AssessmentComponent autosave recovery', () => {
  for (const destroyAt of [0, 450]) {
    it(`cancels validation callbacks when destroyed at ${destroyAt}ms`, fakeAsync(() => {
      const component = Object.create(AssessmentComponent.prototype) as AssessmentComponent;
      component.assessment = { type: 'standard', groups: [{ questions: [{ id: 1, type: 'text' }] }] } as any;
      component.action = 'assessment';
      component.doAssessment = true;
      component.unsubscribe$ = new Subject();
      component.btnDisabled$ = new BehaviorSubject(true);
      (component as any).utils = { isEmpty: () => false };
      spyOn<any>(component, '_isRequired').and.returnValue(true);
      const update = spyOn(component, 'initializePageCompletion');
      (component as any)._populateQuestionsForm();
      tick(destroyAt);
      component.unsubscribe$.next();
      component.unsubscribe$.complete();
      tick(1000);
      expect(update).not.toHaveBeenCalled();
    }));
  }

  for (const sameSubmission of [true, false]) {
    it(`${sameSubmission ? 'preserves' : 'discards'} dirty answers and page position on ${sameSubmission ? 'same-submission' : 'different-submission'} refresh`, fakeAsync(() => {
      const component = Object.create(AssessmentComponent.prototype) as AssessmentComponent;
      component.assessment = { id: 501, type: 'standard' } as any;
      component.submission = { id: 901, status: 'in progress' } as any;
      component.doAssessment = true;
      component.action = 'assessment';
      component.pageIndex = 1;
      component.questionsForm = new FormGroup({ 'q-1': new FormControl('My unsaved answer') });
      component.questionsForm.get('q-1')!.markAsDirty();
      component.btnDisabled$ = new BehaviorSubject(true);
      spyOnProperty(component, 'isPaginationEnabled', 'get').and.returnValue(true);
      spyOn<any>(component, '_handleSubmissionData').and.callFake(() => component.doAssessment = true);
      spyOn<any>(component, '_handleReviewData');
      spyOn<any>(component, '_populateQuestionsForm').and.callFake(() => component.questionsForm = new FormGroup({ 'q-1': new FormControl('Saved server answer') }));
      spyOn<any>(component, '_prefillForm');
      spyOn<any>(component, 'splitGroupsByQuestionCount').and.returnValue([[], []]);
      spyOn(component, 'initializePageCompletion');
      spyOn(component, 'scrollActivePageIntoView');
      component.ngOnChanges({ submission: new SimpleChange({ id: sameSubmission ? 901 : 902 } as any, component.submission, false) });
      expect(component.questionsForm.get('q-1')!.value).toBe(sameSubmission ? 'My unsaved answer' : 'Saved server answer');
      expect(component.pageIndex).toBe(sameSubmission ? 1 : 0);
      tick(500);
    }));
  }

  it('validates answers entered before the delayed form subscription starts', fakeAsync(() => {
    const component = Object.create(AssessmentComponent.prototype) as AssessmentComponent;
    component.assessment = { type: 'standard', groups: [{ questions: [{ id: 1, type: 'text' }] }] } as any;
    component.action = 'assessment';
    component.doAssessment = true;
    component.unsubscribe$ = new Subject();
    component.btnDisabled$ = new BehaviorSubject(true);
    (component as any).utils = { isEmpty: () => false };
    spyOn<any>(component, '_isRequired').and.returnValue(true);
    spyOn(component, 'initializePageCompletion').and.callFake(() => component.setSubmissionDisabled());
    (component as any)._populateQuestionsForm();
    component.questionsForm!.get('q-1')!.setValue('A complete answer');
    tick(600);
    expect(component.btnDisabled$.value).toBeFalse();
    component.unsubscribe$.next();
    component.unsubscribe$.complete();
  }));

  it('accepts an immediate retry while the failure toast is still opening', async () => {
    const component = Object.create(AssessmentComponent.prototype) as AssessmentComponent;
    component.submitActions = new Subject();
    component.resubscribe$ = new Subject();
    component.autosaving = signal({});
    component.saved = signal({});
    component.failed = signal({});
    let finishToast: () => void;
    const toast = new Promise<void>(resolve => { finishToast = resolve; });
    (component as any).notifications = { assessmentSubmittedToast: () => toast };
    spyOn<any>(component, '_preventSubmission').and.returnValue(false);
    const save = spyOn(component, 'saveQuestionAnswer').and.returnValues(
      throwError(() => new Error('Autosave failed')), of({ autoSave: true }),
    );
    const reconnect = component.resubscribe$.subscribe(() => component.subscribeSaveSubmission());
    component.subscribeSaveSubmission();
    const request = { autoSave: true, goBack: false, questionSave: { submissionId: 901, questionId: 1, answer: 'Retain my answer' } };
    component.submitActions.next(request);
    component.failed.set({ 1: true });
    component.submitActions.next(request);
    expect(save).toHaveBeenCalledTimes(2);
    expect(component.failed()[1]).toBeFalse();
    finishToast!();
    await toast;
    reconnect.unsubscribe();
    component.submitActions.complete();
  });
});
