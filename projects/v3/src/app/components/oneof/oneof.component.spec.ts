import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OneofComponent } from './oneof.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';

describe('OneofComponent', () => {
  let component: OneofComponent;
  let fixture: ComponentFixture<OneofComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [OneofComponent],
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
    fixture = TestBed.createComponent(OneofComponent);
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

  describe('isDisplayOnly()', () => {
    it('should be true when learner has answered the question', () => {
      component.doAssessment = false; // answer already submitted
      component.doReview = false; // learner cant do review
      component.submissionStatus = 'pending review';
      component.reviewStatus = 'not start'; // @TODO: grammar error: "not started"

      expect(component.isDisplayOnly).toBeTrue();
    });

    it('should be false question is being reviewed', () => {
      component.doAssessment = false; // answer already submitted
      component.doReview = true; // learner cant do review
      component.question = { canAnswer: true };
      component.submissionStatus = 'pending review';
      component.reviewStatus = 'not start'; // @TODO: grammar error: "not started"

      expect(component.isDisplayOnly).toBeFalse();
    });

    it('should be false when learner is doing the question', () => {
      component.doAssessment = true; // answer already submitted
      component.doReview = false; // learner cant do review
      component.question = { canAnswer: true };
      component.submissionStatus = 'in progress';

      expect(component.isDisplayOnly).toBeFalse();
    });
  });
});

