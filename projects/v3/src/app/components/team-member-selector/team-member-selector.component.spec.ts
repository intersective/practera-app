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
      expect(component.innerValue).toEqual(component.submission.answer);
      expect(component.control.value).toEqual(component.submission.answer);
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
      expect(component.innerValue).toEqual(component.review);
      expect(component.comment).toEqual(component.review.comment);
      expect(component.control.value).toEqual(component.review);
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
});

