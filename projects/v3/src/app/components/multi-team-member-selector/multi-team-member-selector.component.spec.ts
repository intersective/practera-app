import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiTeamMemberSelectorComponent } from './multi-team-member-selector.component';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { Subject } from 'rxjs';

describe('MultiTeamMemberSelectorComponent', () => {
  let component: MultiTeamMemberSelectorComponent;
  let fixture: ComponentFixture<MultiTeamMemberSelectorComponent>;
  let utilsSpy: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MultiTeamMemberSelectorComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiTeamMemberSelectorComponent);
    component = fixture.componentInstance;
    utilsSpy = TestBed.inject(UtilsService);

    component.control = new FormControl();
    component.submitActions$ = new Subject<any>();
    component.question = { audience: [] } as any;
    component.submission = {};
    component.review = {};
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('ngOnInit()', () => {
    it('should call _showSavedAnswers()', () => {
      // use "any" to bypass ts restriction on type (not recommended, for acceptable for internal implementation)
      spyOn<any>(component, '_showSavedAnswers');
      component.ngOnInit();
      expect((component as any)._showSavedAnswers).toHaveBeenCalled();
    });
  });

  describe('onChange()', () => {
    it('should update innerValue and call propagateChange when type is not provided', () => {
      spyOn(component, 'propagateChange');
      utilsSpy.addOrRemove = jasmine.createSpy('addOrRemove').and.returnValue(['value1', 'value2']);
      component.control = new FormControl();

      component.onChange('value1');

      expect(component.innerValue).toEqual(['value1', 'value2']);
      expect(component.propagateChange).toHaveBeenCalledWith(['value1', 'value2']);
    });

    it('should update innerValue and call propagateChange when type is "comment"', () => {
      spyOn(component, 'propagateChange');
      component.control = new FormControl();
      component.innerValue = {
        answer: [],
        comment: ''
      };

      component.onChange('new comment', 'comment');

      expect(component.innerValue).toEqual({
        answer: [],
        comment: 'new comment'
      });
      expect(component.propagateChange).toHaveBeenCalledWith({
        answer: [],
        comment: 'new comment'
      });
    });

    it('should update innerValue and call propagateChange when type is not "comment"', () => {
      spyOn(component, 'propagateChange');
      utilsSpy.addOrRemove = jasmine.createSpy('addOrRemove').and.returnValue(['value1']);
      component.control = new FormControl();
      component.innerValue = {
        answer: [],
        comment: ''
      };

      component.onChange('value1', 'answer');

      expect(component.innerValue).toEqual({
        answer: ['value1'],
        comment: ''
      });
      expect(component.propagateChange).toHaveBeenCalledWith({
        answer: ['value1'],
        comment: ''
      });
    });

    it('should set errors and call submitActions$.next()', () => {
      spyOn(component.submitActions$, 'next');
      component.control = new FormControl('', Validators.required) as any;

      component.onChange('value1');

      expect(component.errors).toContain('This question is required');
      expect(component.submitActions$.next).toHaveBeenCalledWith(
        jasmine.objectContaining({
          autoSave: true,
          goBack: false,
        })
      );
    });
  });

  describe('writeValue()', () => {
    it('should set innerValue when a value is provided', () => {
      const value = {
        answer: ['value1', 'value2'],
        comment: 'a comment',
      };

      component.writeValue(value);
      // writeValue sets innerValue directly without stringify
      expect(component.innerValue).toEqual(value);
    });

    it('should not update innerValue when the value is undefined or null', () => {
      component.innerValue = 'initialValue';

      component.writeValue(undefined);
      expect(component.innerValue).toEqual('initialValue');

      component.writeValue(null);
      expect(component.innerValue).toEqual('initialValue');
    });

    it('should normalize non-array answer in review mode', () => {
      component.doReview = true;
      component.writeValue({ answer: 'not-array', comment: 'test' });

      expect(Array.isArray(component.innerValue.answer)).toBeTrue();
      expect(component.innerValue.answer).toEqual([]);
    });

    it('should keep array answer in review mode', () => {
      component.doReview = true;
      component.writeValue({ answer: ['member1'], comment: 'test' });

      expect(component.innerValue.answer).toEqual(['member1']);
    });

    it('should normalize non-array value to plain array in assessment mode', () => {
      component.doAssessment = true;
      component.doReview = false;
      component.writeValue({ answer: ['member1'], comment: 'test' });

      // in assessment mode, innerValue should be a plain array
      expect(Array.isArray(component.innerValue)).toBeTrue();
      expect(component.innerValue).toEqual(['member1']);
    });

    it('should normalize non-array value to empty array in assessment mode', () => {
      component.doAssessment = true;
      component.doReview = false;
      component.writeValue('not-an-array');

      expect(Array.isArray(component.innerValue)).toBeTrue();
      expect(component.innerValue).toEqual([]);
    });

    it('should set comment from value when present', () => {
      component.doReview = true;
      component.writeValue({ answer: [], comment: 'new comment' });

      expect(component.comment).toBe('new comment');
    });
  });

  describe('_showSavedAnswers()', () => {
    it('should set innerValue and propagate changes for in-progress review', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review.answer = ['answer1'];
      component.review.comment = 'comment1';
      component.control = new FormControl('') as any;

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual({
        answer: ['answer1'],
        comment: 'comment1',
      });
      // propagateChange doesn't update control.value, so we only check innerValue
    });

    it('should set innerValue and propagate changes for in-progress submission', () => {
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission.answer = ['answer1'];
      component.control = new FormControl('') as any;

      component['_showSavedAnswers']();

      // in assessment mode, innerValue is a plain array (not an object)
      expect(component.innerValue).toEqual(['answer1']);
    });

    it('should preserve control value when control is dirty in review mode', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = { answer: ['saved'], comment: 'saved comment' };
      const dirtyValue = { answer: ['user-edited'], comment: 'user comment' };
      component.control = new FormControl(dirtyValue) as any;
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual(dirtyValue);
      expect(component.comment).toBe('user comment');
    });

    it('should normalize non-array answer when control is dirty in review mode', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = { answer: ['saved'], comment: 'saved comment' };
      const dirtyValue = { answer: 'not-an-array', comment: 'user comment' };
      component.control = new FormControl(dirtyValue) as any;
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(Array.isArray(component.innerValue.answer)).toBeTrue();
      expect(component.innerValue.answer).toEqual([]);
    });

    it('should normalize non-array answer to empty array when review data is pristine', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = { answer: 'not-an-array', comment: 'comment' };
      component.control = new FormControl('') as any;

      component['_showSavedAnswers']();

      expect(component.innerValue.answer).toEqual([]);
    });

    it('should fallback to review comment when dirty value has no comment', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = { answer: ['saved'], comment: 'saved comment' };
      const dirtyValue = { answer: ['user-edited'] };
      component.control = new FormControl(dirtyValue) as any;
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.comment).toBe('saved comment');
    });

    it('should preserve control value when control is dirty in assessment mode', () => {
      component.reviewStatus = '';
      component.doReview = false;
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: ['saved'] };
      const dirtyValue = ['user-edited'];
      component.control = new FormControl(dirtyValue) as any;
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual(['user-edited']);
    });

    it('should default to empty array when submission answer is null in assessment mode', () => {
      component.reviewStatus = '';
      component.doReview = false;
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: null };
      component.control = new FormControl('') as any;

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual([]);
    });
  });

  describe('audienceContainReviewer()', () => {
    it('should return true if question audience contains more than one audience and includes reviewer', () => {
      component.question.audience = ['student', 'reviewer'];
      expect(component.audienceContainReviewer()).toBeTruthy();
    });

    it('should return false if question audience does not contain more than one audience or does not include reviewer', () => {
      component.question.audience = ['student'];
      expect(component.audienceContainReviewer()).toBeFalsy();
    });
  });

  describe('isSelectedInSubmission()', () => {
    const teamMember = { key: JSON.stringify({ name: 'User1', recipientId: 1, recipientEmail: 'u1@test.com', userId: 10 }), userName: 'User1' };

    it('should return false when submission is null', () => {
      component.submission = null;
      expect(component.isSelectedInSubmission(teamMember)).toBeFalse();
    });

    it('should return false when submission is undefined', () => {
      component.submission = undefined;
      expect(component.isSelectedInSubmission(teamMember)).toBeFalse();
    });

    it('should return false when submission.answer is null', () => {
      component.submission = { answer: null };
      expect(component.isSelectedInSubmission(teamMember)).toBeFalse();
    });

    it('should return true when team member is selected in submission answer', () => {
      component.submission = {
        answer: [JSON.stringify({ name: 'User1', recipientId: 1, recipientEmail: 'u1@test.com', userId: 10 })],
      };
      expect(component.isSelectedInSubmission(teamMember)).toBeTrue();
    });

    it('should return false when team member is not selected in submission answer', () => {
      component.submission = {
        answer: [JSON.stringify({ name: 'Other', recipientId: 2, recipientEmail: 'o@test.com', userId: 99 })],
      };
      expect(component.isSelectedInSubmission(teamMember)).toBeFalse();
    });
  });

  describe('isSelectedInReview()', () => {
    const teamMember = { key: JSON.stringify({ name: 'User1', recipientId: 1, recipientEmail: 'u1@test.com', userId: 10 }), userName: 'User1' };

    it('should return false when review is null', () => {
      component.review = null;
      expect(component.isSelectedInReview(teamMember)).toBeFalse();
    });

    it('should return false when review is undefined', () => {
      component.review = undefined;
      expect(component.isSelectedInReview(teamMember)).toBeFalse();
    });

    it('should return false when review.answer is null', () => {
      component.review = { answer: null };
      expect(component.isSelectedInReview(teamMember)).toBeFalse();
    });

    it('should return true when team member is selected in review answer', () => {
      component.review = {
        answer: [JSON.stringify({ name: 'User1', recipientId: 1, recipientEmail: 'u1@test.com', userId: 10 })],
      };
      expect(component.isSelectedInReview(teamMember)).toBeTrue();
    });

    it('should return false when team member is not selected in review answer', () => {
      component.review = {
        answer: [JSON.stringify({ name: 'Other', recipientId: 2, recipientEmail: 'o@test.com', userId: 99 })],
      };
      expect(component.isSelectedInReview(teamMember)).toBeFalse();
    });
  });
});
