import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TeamMemberSelectorComponent } from './team-member-selector.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { Subject } from 'rxjs';

describe('TeamMemberSelectorComponent', () => {
  let component: TeamMemberSelectorComponent;
  let fixture: ComponentFixture<TeamMemberSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TeamMemberSelectorComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamMemberSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should show only the reviewer-selected member in reviewer feedback', () => {
    component.question = {
      teamMembers: [
        { key: 'member-1', userName: 'Member 1' },
        { key: 'member-2', userName: 'Member 2' },
      ],
    };
    component.review = { answer: 'member-2' };
    component.isReviewerFeedbackContext = true;

    expect(component.displayTeamMembers.map(member => member.key)).toEqual(['member-2']);

    component.isReviewerFeedbackContext = false;
    expect(component.displayTeamMembers.length).toBe(2);
  });

  it('should render the learner ownership chip before the selected member', () => {
    component.question = {
      teamMembers: [
        { key: 'member-1', userName: 'Member 1' },
        { key: 'member-2', userName: 'Member 2' },
      ],
      audience: ['submitter', 'reviewer'],
    };
    component.submissionStatus = 'feedback available';
    component.reviewStatus = 'done';
    component.doAssessment = false;
    component.doReview = false;
    component.viewerRole = 'learner';
    component.submission = { answer: 'member-1' };
    component.review = { answer: 'member-2' };

    fixture.detectChanges();

    const learnerItem = fixture.nativeElement.querySelector('ion-list ion-item');
    const labelChildren = Array.from(learnerItem.querySelector('ion-label').children);
    expect(labelChildren.indexOf(learnerItem.querySelector('p')))
      .toBeLessThan(labelChildren.indexOf(learnerItem.querySelector('.answer-content')));
    expect(learnerItem.textContent).toContain('Your Answer');
  });

  describe('when testing onInit()', () => {
    it('should get correct data for in progress submission', () => {
      component.question = {
        choices: [
          { id: 1, name: 'choice1' },
          { id: 2, name: 'choice2' }
        ],
        audience: []
      };
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: 'abc' };
      component.reviewStatus = 'not started';
      component.doReview = false;
      component.review = {};
      component.control = new FormControl('');
      fixture.detectChanges();
      // component sets innerValue from submission.answer when control is pristine
      expect(component.innerValue).toEqual(component.submission.answer);
    });

    it('should get correct data for in progress review', () => {
      component.question = {
        choices: [
          { id: 1, name: 'choice1' },
          { id: 2, name: 'choice2' }
        ],
        audience: []
      };
      component.submissionStatus = 'pending review';
      component.doAssessment = false;
      component.submission = { answer: 'abc' };
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = {
        comment: 'asdf',
        answer: { name: 'abc' }
      };
      component.control = new FormControl('');
      fixture.detectChanges();
      // component sets innerValue to review data
      expect(component.innerValue).toEqual({
        answer: component.review.answer,
        comment: component.review.comment
      });
      expect(component.comment).toEqual(component.review.comment);
    });
  });

  describe('when testing onChange()', () => {
    beforeEach(() => {
      component.control = new FormControl('');
      component.control.setErrors({});
      component.submitActions$ = new Subject();
      component.propagateChange = jasmine.createSpy('propagateChange');
      spyOn(component.submitActions$, 'next');
    });
    it('should return error if there are invalidations', () => {
      component.control.setErrors({
        key: 'error'
      });
      component.onChange(4, null);
      expect(component.errors.length).toBe(1);
    });
    it('should return error if required not filled', () => {
      component.control.setErrors({
        required: true
      });
      component.onChange(4, null);
      expect(component.errors.length).toBe(1);
      expect(component.errors[0]).toContain('is required');
    });
    it('should get correct data when writing submission answer', () => {
      component.onChange(4, null);
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual(4);
    });
    it('should get correct data when writing submission answer', () => {
      component.innerValue = 1;
      component.onChange(4, null);
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual(4);
    });
    it('should get correct data when writing review answer', () => {
      component.innerValue = { answer: 1, comment: '' };
      component.onChange(2, 'answer');
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual({ answer: 2, comment: '' });
    });
    it('should get correct data when writing review comment', () => {
      component.onChange('data', 'comment');
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual({ answer: '', comment: 'data' });
    });
  });

  it('when testing writeValue(), it should pass data correctly', () => {
    component.writeValue({ data: 'data' });
    expect(component.innerValue).toEqual({ data: 'data' });
    component.writeValue(null);
  });
  it('when testing registerOnChange()', () => {
    component.registerOnChange(() => true);
    expect(component.propagateChange).toBeTruthy();
    component.registerOnTouched(() => true);
  });

  describe('_showSavedAnswers()', () => {
    it('should set innerValue based on review data if reviewStatus is in progress and doReview is true', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = {
        comment: 'Test comment',
        answer: 'Test answer',
      };

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual({
        comment: 'Test comment',
        answer: 'Test answer',
      });
    });

    it('should set innerValue based on submission data if submissionStatus is in progress and doAssessment is true', () => {
      component.reviewStatus = 'not in progress';
      component.doReview = false;
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = {
        answer: 'Test submission answer',
      };
      component.control = new FormControl('');

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual('Test submission answer');
    });

    it('should not change innerValue if reviewStatus and submissionStatus are not in progress', () => {
      component.reviewStatus = 'not in progress';
      component.doReview = false;
      component.submissionStatus = 'not in progress';
      component.doAssessment = false;

      component['_showSavedAnswers']();

      expect(component.innerValue).toBeUndefined();
    });

    it('should preserve control value when control is dirty in review mode', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = {
        comment: 'saved comment',
        answer: 'saved answer',
      };
      component.control = new FormControl({ answer: 'user edited', comment: 'user comment' });
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual({ answer: 'user edited', comment: 'user comment' });
      expect(component.comment).toBe('user comment');
    });

    it('should fallback to review comment when dirty value has no comment', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = {
        comment: 'saved comment',
        answer: 'saved answer',
      };
      component.control = new FormControl({ answer: 'user edited' });
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.comment).toBe('saved comment');
    });

    it('should preserve control value when control is dirty in assessment mode', () => {
      component.reviewStatus = '';
      component.doReview = false;
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: 'saved' };
      component.control = new FormControl('user edited');
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.innerValue).toBe('user edited');
    });
  });

  describe('audienceContainReviewer()', () => {
    it('should return true if audience contains reviewer and has more than one member', () => {
      component.question = {
        audience: ['reviewer', 'other']
      };

      expect(component.audienceContainReviewer()).toBe(true);
    });

    it('should return false if audience does not contain reviewer', () => {
      component.question = {
        audience: ['other']
      };

      expect(component.audienceContainReviewer()).toBe(false);
    });

    it('should return false if audience contains reviewer but has only one member', () => {
      component.question = {
        audience: ['reviewer']
      };

      expect(component.audienceContainReviewer()).toBe(false);
    });
  });

  describe('triggerSave()', () => {
    beforeEach(() => {
      component.question = { id: 15, audience: [] };
      component.submissionId = 70;
      component.reviewId = 80;
      component.submitActions$ = jasmine.createSpyObj('Subject', ['next']);
    });

    it('should emit review save action when doReview is true', () => {
      component.doReview = true;
      component.doAssessment = false;
      component.innerValue = { answer: 'member-1', comment: 'good choice' };

      component.triggerSave();

      expect(component.submitActions$.next).toHaveBeenCalledWith(jasmine.objectContaining({
        autoSave: true,
        goBack: false,
        reviewSave: {
          reviewId: 80,
          submissionId: 70,
          questionId: 15,
          answer: 'member-1',
          comment: 'good choice',
        },
      }));
    });

    it('should emit question save action when doAssessment is true', () => {
      component.doAssessment = true;
      component.doReview = false;
      component.innerValue = 'member-2';

      component.triggerSave();

      expect(component.submitActions$.next).toHaveBeenCalledWith(jasmine.objectContaining({
        autoSave: true,
        goBack: false,
        questionSave: {
          submissionId: 70,
          questionId: 15,
          answer: 'member-2',
        },
      }));
    });
  });

  describe('onLabelToggle / onLabelToggleReview', () => {
    beforeEach(() => {
      component.control = new FormControl('');
      component.submitActions$ = new Subject();
      spyOn(component, 'onChange');
    });

    it('onLabelToggle should call onChange with id', () => {
      component.onLabelToggle('member-1');
      expect(component.onChange).toHaveBeenCalledWith('member-1');
    });

    it('onLabelToggleReview should call onChange with id and answer type', () => {
      component.onLabelToggleReview('member-1');
      expect(component.onChange).toHaveBeenCalledWith('member-1', 'answer');
    });
  });

  describe('isDisplayOnly()', () => {
    it('should be true when reviewer has canAnswer false', () => {
      component.doReview = true;
      component.doAssessment = false;
      component.question = { canAnswer: false, audience: [] };
      expect(component.isDisplayOnly).toBeTrue();
    });

    it('should be true when status is feedback available', () => {
      component.doAssessment = false;
      component.doReview = false;
      component.submissionStatus = 'feedback available';
      component.submission = { answer: 'member-1' };
      expect(component.isDisplayOnly).toBeTruthy();
    });

    it('should be true when status is pending review', () => {
      component.doAssessment = false;
      component.doReview = false;
      component.submissionStatus = 'pending review';
      component.submission = { answer: 'member-1' };
      expect(component.isDisplayOnly).toBeTruthy();
    });

    it('should be true when done with empty review status', () => {
      component.doAssessment = false;
      component.doReview = false;
      component.submissionStatus = 'done';
      component.reviewStatus = '';
      component.submission = { answer: 'member-1' };
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
      component.question = { canAnswer: true, audience: [] };
      expect(component.isDisplayOnly).toBeFalse();
    });
  });

  describe('_showSavedAnswers() - "not start" review status', () => {
    it('should load review data when reviewStatus is "not start"', () => {
      component.reviewStatus = 'not start';
      component.doReview = true;
      component.review = { answer: 'member-x', comment: 'test' };
      component.control = new FormControl('');

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual({
        answer: 'member-x',
        comment: 'test',
      });
    });
  });

  describe('_showSavedAnswers() - propagateChange call', () => {
    it('should call propagateChange with innerValue', () => {
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: 'member-1' };
      component.reviewStatus = '';
      component.doReview = false;
      component.control = new FormControl('');
      spyOn(component, 'propagateChange');

      component['_showSavedAnswers']();

      expect(component.propagateChange).toHaveBeenCalledWith('member-1');
    });
  });
});
