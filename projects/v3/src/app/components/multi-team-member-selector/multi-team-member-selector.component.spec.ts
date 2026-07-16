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

  it('should show only reviewer-selected members in reviewer feedback', () => {
    const member1 = JSON.stringify({ userId: 1 });
    const member2 = JSON.stringify({ userId: 2 });
    component.question = {
      audience: ['reviewer'],
      teamMembers: [
        { key: member1, userName: 'Member 1' },
        { key: member2, userName: 'Member 2' },
      ],
    } as any;
    component.review = { answer: [member2] };
    component.isReviewerFeedbackContext = true;

    expect(component.displayTeamMembers.map(member => member.key)).toEqual([member2]);

    component.isReviewerFeedbackContext = false;
    expect(component.displayTeamMembers.length).toBe(2);
  });

  it('should render the learner ownership chip before the selected member', () => {
    const member1 = JSON.stringify({ userId: 1 });
    const member2 = JSON.stringify({ userId: 2 });
    component.question = {
      audience: ['submitter', 'reviewer'],
      teamMembers: [
        { key: member1, userName: 'Member 1' },
        { key: member2, userName: 'Member 2' },
      ],
    } as any;
    component.submissionStatus = 'feedback available';
    component.reviewStatus = 'done';
    component.doAssessment = false;
    component.doReview = false;
    component.viewerRole = 'learner';
    component.submission = { answer: [member1] };
    component.review = { answer: [member2] };

    fixture.detectChanges();

    const learnerItem = fixture.nativeElement.querySelector('ion-list ion-item');
    const labelChildren = Array.from(learnerItem.querySelector('ion-label').children);
    expect(labelChildren.indexOf(learnerItem.querySelector('p')))
      .toBeLessThan(labelChildren.indexOf(learnerItem.querySelector('.answer-content')));
    expect(learnerItem.textContent).toContain('Your Answer');
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

  describe('isSelected()', () => {
    const teamMember = { key: JSON.stringify({ name: 'User1', recipientId: 1, recipientEmail: 'u1@test.com', userId: 10 }), userName: 'User1' };

    it('should return false when innerValue is null', () => {
      component.innerValue = null;
      expect(component.isSelected(teamMember)).toBeFalse();
    });

    it('should return true in assessment mode when member is in innerValue', () => {
      component.doAssessment = true;
      component.doReview = false;
      component.innerValue = [JSON.stringify({ name: 'User1', recipientId: 1, recipientEmail: 'u1@test.com', userId: 10 })];
      expect(component.isSelected(teamMember)).toBeTrue();
    });

    it('should return false in assessment mode when member is not in innerValue', () => {
      component.doAssessment = true;
      component.doReview = false;
      component.innerValue = [JSON.stringify({ name: 'Other', recipientId: 2, recipientEmail: 'o@test.com', userId: 99 })];
      expect(component.isSelected(teamMember)).toBeFalse();
    });

    it('should return true in review mode when member is in innerValue.answer', () => {
      component.doReview = true;
      component.doAssessment = false;
      component.innerValue = {
        answer: [JSON.stringify({ name: 'User1', recipientId: 1, recipientEmail: 'u1@test.com', userId: 10 })],
        comment: '',
      };
      expect(component.isSelected(teamMember)).toBeTrue();
    });

    it('should return false in review mode when innerValue.answer is undefined', () => {
      component.doReview = true;
      component.doAssessment = false;
      component.innerValue = { comment: '' };
      expect(component.isSelected(teamMember)).toBeFalse();
    });
  });

  describe('triggerSave()', () => {
    beforeEach(() => {
      component.question = { id: 20, audience: [] } as any;
      component.submissionId = 50;
      component.reviewId = 60;
      component.submitActions$ = jasmine.createSpyObj('Subject', ['next']);
    });

    it('should emit review save action when doReview is true', () => {
      component.doReview = true;
      component.doAssessment = false;
      component.innerValue = { answer: ['member-1'], comment: 'review comment' };

      component.triggerSave();

      expect(component.submitActions$.next).toHaveBeenCalledWith(jasmine.objectContaining({
        autoSave: true,
        goBack: false,
        reviewSave: {
          reviewId: 60,
          submissionId: 50,
          questionId: 20,
          answer: ['member-1'],
          comment: 'review comment',
        },
      }));
    });

    it('should emit question save action when doAssessment is true', () => {
      component.doAssessment = true;
      component.doReview = false;
      component.innerValue = ['member-a', 'member-b'];

      component.triggerSave();

      expect(component.submitActions$.next).toHaveBeenCalledWith(jasmine.objectContaining({
        autoSave: true,
        goBack: false,
        questionSave: {
          submissionId: 50,
          questionId: 20,
          answer: ['member-a', 'member-b'],
        },
      }));
    });
  });

  describe('onLabelToggle / onLabelToggleReview', () => {
    beforeEach(() => {
      component.control = new FormControl('') as any;
      component.submitActions$ = new Subject();
      spyOn(component, 'onChange');
    });

    it('onLabelToggle should call onChange without type', () => {
      component.onLabelToggle('member-1');
      expect(component.onChange).toHaveBeenCalledWith('member-1');
    });

    it('onLabelToggleReview should call onChange with answer type', () => {
      component.onLabelToggleReview('member-1');
      expect(component.onChange).toHaveBeenCalledWith('member-1', 'answer');
    });
  });

  describe('registerOnChange() / registerOnTouched()', () => {
    it('registerOnChange should set propagateChange', () => {
      const fn = jasmine.createSpy('onChange');
      component.registerOnChange(fn);
      component.propagateChange('test');
      expect(fn).toHaveBeenCalledWith('test');
    });

    it('registerOnTouched should not throw', () => {
      expect(() => component.registerOnTouched(() => {})).not.toThrow();
    });
  });

  describe('isDisplayOnly', () => {
    it('should be true when reviewer has canAnswer false', () => {
      component.doReview = true;
      component.doAssessment = false;
      component.question = { canAnswer: false, audience: [] } as any;
      expect(component.isDisplayOnly).toBeTrue();
    });

    it('should be truthy when feedback available with submission answer', () => {
      component.doAssessment = false;
      component.doReview = false;
      component.submissionStatus = 'feedback available';
      component.submission = { answer: ['member-1'] };
      expect(component.isDisplayOnly).toBeTruthy();
    });

    it('should be truthy when pending review with submission answer', () => {
      component.doAssessment = false;
      component.doReview = false;
      component.submissionStatus = 'pending review';
      component.submission = { answer: ['member-1'] };
      expect(component.isDisplayOnly).toBeTruthy();
    });

    it('should be truthy when done with empty review status', () => {
      component.doAssessment = false;
      component.doReview = false;
      component.submissionStatus = 'done';
      component.reviewStatus = '';
      component.submission = { answer: ['member-1'] };
      expect(component.isDisplayOnly).toBeTruthy();
    });

    it('should be false when doing assessment', () => {
      component.doAssessment = true;
      component.doReview = false;
      expect(component.isDisplayOnly).toBeFalse();
    });

    it('should be false when doing review with canAnswer true', () => {
      component.doAssessment = false;
      component.doReview = true;
      component.question = { canAnswer: true, audience: [] } as any;
      expect(component.isDisplayOnly).toBeFalse();
    });
  });

  describe('_showSavedAnswers() - "not start" review status', () => {
    it('should load review data when reviewStatus is "not start"', () => {
      component.reviewStatus = 'not start';
      component.doReview = true;
      component.review = { answer: ['member-x'], comment: 'test' };
      component.control = new FormControl(null) as any;

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual({
        answer: ['member-x'],
        comment: 'test',
      });
    });
  });

  describe('_showSavedAnswers() - propagateChange call', () => {
    it('should call propagateChange with innerValue', () => {
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: ['member-1'] };
      component.reviewStatus = '';
      component.doReview = false;
      component.control = new FormControl(null) as any;
      spyOn(component, 'propagateChange');

      component['_showSavedAnswers']();

      expect(component.propagateChange).toHaveBeenCalledWith(['member-1']);
    });
  });

  describe('onChange() - initializes innerValue for review mode', () => {
    it('should initialize innerValue with answer array and empty comment when innerValue is null', () => {
      component.innerValue = null;
      component.control = new FormControl('') as any;
      utilsSpy.addOrRemove = jasmine.createSpy('addOrRemove').and.returnValue(['member-1']);
      spyOn(component, 'propagateChange');

      component.onChange('member-1', 'answer');

      expect(component.innerValue.answer).toEqual(['member-1']);
      expect(component.innerValue.comment).toBe('');
    });

    it('should normalize non-array answer to empty array before toggling', () => {
      component.innerValue = { answer: 'not-array', comment: '' };
      component.control = new FormControl('') as any;
      utilsSpy.addOrRemove = jasmine.createSpy('addOrRemove').and.returnValue(['member-1']);
      spyOn(component, 'propagateChange');

      component.onChange('member-1', 'answer');

      expect(utilsSpy.addOrRemove).toHaveBeenCalledWith([], 'member-1');
    });
  });
});
