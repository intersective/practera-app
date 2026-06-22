import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { SliderComponent } from './slider.component';

describe('SliderComponent', () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SliderComponent],
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderComponent);
    component = fixture.componentInstance;

    // Mock question data for slider
    component.question = {
      id: 1,
      name: 'Test Slider Question',
      description: 'Test description',
      type: 'slider',
      isRequired: false,
      canAnswer: true,
      canComment: false,
      choices: null,
      audience: ['submitter'],
      min: 1,
      max: 5
    };

    component.control = new FormControl();
    component.submitActions$ = new Subject();
    component.doAssessment = true;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize slider properties from question min/max', () => {
    component.ngOnInit();

    expect(component.sliderMin).toBe(1);
    expect(component.sliderMax).toBe(5);
    expect(component.generatedChoices.length).toBe(5);
    expect(component.generatedChoices[0]).toEqual({ id: 1, name: '1' });
    expect(component.generatedChoices[4]).toEqual({ id: 5, name: '5' });
  });

  it('should handle string values in min/max from API', () => {
    // Test the actual API response scenario where max is a string "10"
    component.question.min = 1;
    component.question.max = '10' as any; // API returns string values sometimes

    component.ngOnInit();

    expect(component.sliderMin).toBe(1);
    expect(component.sliderMax).toBe(10);
    expect(component.generatedChoices.length).toBe(10);
  });

  it('should return correct slider value', () => {
    component.innerValue = 3;
    expect(component.getSliderValue()).toBe(3);
  });

  it('should handle slider change', () => {
    const event = { detail: { value: 4 } };
    spyOn(component, 'onChange');

    component.onSliderChange(event);

    expect(component.onChange).toHaveBeenCalledWith(4);
  });

  it('should handle label click', () => {
    component.ngOnInit(); // Generate choices
    spyOn(component, 'onChange');

    component.onLabelClick(2); // Index 2 = value 3 (1-based)

    expect(component.onChange).toHaveBeenCalledWith(3);
  });

  it('should return correct selected choice label', () => {
    component.innerValue = 4;
    expect(component.getSelectedChoiceLabel()).toBe('4');
  });

  it('should format pin correctly', () => {
    expect(component.pinFormatter(7)).toBe('7');
  });

  it('should check inner value correctly', () => {
    component.innerValue = 2;
    expect(component.checkInnerValue(2)).toBe(true);
    expect(component.checkInnerValue(3)).toBeFalsy();
  });

  it('should return numeric value for getChoiceNameById', () => {
    expect(component.getChoiceNameById(8)).toBe('8');
    expect(component.getChoiceNameById(null)).toBe('');
  });

  it('should get selected choice label with parameter', () => {
    expect(component.getSelectedChoiceLabel(2)).toBe('2');
    expect(component.getSelectedChoiceLabel()).toBe(component.innerValue?.toString() || '');
  });

  describe('Review functionality', () => {
    it('should get submission slider value', () => {
      component.submission = { answer: 4 };
      expect(component.getSubmissionSliderValue()).toBe(4);
    });

    it('should get review slider value', () => {
      component.innerValue = { answer: 5, comment: 'test' };
      expect(component.getReviewSliderValue()).toBe(5);
    });

    it('should handle review slider change', () => {
      const event = { detail: { value: 3 } };
      spyOn(component, 'onChange');

      component.onReviewSliderChange(event);

      expect(component.onChange).toHaveBeenCalledWith(3, 'answer');
    });

    it('should handle review label click', () => {
      component.ngOnInit(); // Generate choices
      spyOn(component, 'onChange');

      component.onReviewLabelClick(1); // Index 1 = value 2

      expect(component.onChange).toHaveBeenCalledWith(2, 'answer');
    });

    it('should check review value correctly', () => {
      component.innerValue = { answer: 3, comment: 'test' };
      expect(component.checkReviewValue(3)).toBe(true);
      expect(component.checkReviewValue(2)).toBe(false);
    });

    it('should return false for checkReviewValue when no answer', () => {
      component.innerValue = { comment: 'test' };
      expect(component.checkReviewValue(3)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle missing min/max gracefully', () => {
      // reset the slider values to defaults before testing
      component.sliderMin = 0;
      component.sliderMax = 100;
      component.generatedChoices = [];

      component.question.min = undefined;
      component.question.max = undefined;

      component.ngOnInit();

      // when both min and max are undefined, the condition
      // (this.question.min !== undefined || this.question.max !== undefined) is false
      // so sliderMin and sliderMax remain at their initial/reset values
      expect(component.sliderMin).toBe(0);
      expect(component.sliderMax).toBe(100);
      // Since the condition requires at least one of min/max to be defined,
      // and both are undefined, generatedChoices won't be populated
      expect(component.generatedChoices.length).toBe(0);
    });

    it('should return sliderMin when innerValue is null', () => {
      component.sliderMin = 5;
      component.innerValue = null;
      expect(component.getSliderValue()).toBe(5);
    });

    it('should return sliderMin for submission when answer is null', () => {
      component.sliderMin = 2;
      component.submission = { answer: null };
      expect(component.getSubmissionSliderValue()).toBe(2);
    });

    it('should return sliderMin for review when answer is null', () => {
      component.sliderMin = 3;
      component.innerValue = { answer: null, comment: 'test' };
      expect(component.getReviewSliderValue()).toBe(3);
    });
  });

  describe('triggerSave()', () => {
    beforeEach(() => {
      component.question = { id: 10, type: 'slider', min: 1, max: 5, audience: ['submitter'], name: 'q', description: '', isRequired: false, canAnswer: true, canComment: false };
      component.submissionId = 50;
      component.reviewId = 60;
      component.submitActions$ = jasmine.createSpyObj('Subject', ['next']);
    });

    it('should emit review save action when doReview is true', () => {
      component.doReview = true;
      component.doAssessment = false;
      component.innerValue = { answer: 3, comment: 'nice' };

      component.triggerSave();

      expect(component.submitActions$.next).toHaveBeenCalledWith(jasmine.objectContaining({
        autoSave: true,
        goBack: false,
        reviewSave: {
          reviewId: 60,
          submissionId: 50,
          questionId: 10,
          answer: 3,
          comment: 'nice',
        },
      }));
    });

    it('should emit question save action when doAssessment is true', () => {
      component.doAssessment = true;
      component.doReview = false;
      component.innerValue = 4;

      component.triggerSave();

      expect(component.submitActions$.next).toHaveBeenCalledWith(jasmine.objectContaining({
        autoSave: true,
        goBack: false,
        questionSave: {
          submissionId: 50,
          questionId: 10,
          answer: 4,
        },
      }));
    });
  });

  describe('_showSavedAnswers()', () => {
    it('should call propagateChange with innerValue', () => {
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: 3 };
      component.reviewStatus = '';
      component.doReview = false;
      component.control = new FormControl('');
      spyOn(component, 'propagateChange');

      component['_showSavedAnswers']();

      expect(component.propagateChange).toHaveBeenCalledWith(3);
    });

    it('should load review data when reviewStatus is "not start"', () => {
      component.reviewStatus = 'not start';
      component.doReview = true;
      component.review = { answer: 2, comment: 'a comment' };
      component.control = new FormControl('');

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual({ answer: 2, comment: 'a comment' });
    });

    it('should preserve dirty control value in review mode', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = { answer: 2, comment: 'saved' };
      component.control = new FormControl({ answer: 5, comment: 'edited' });
      component.control.markAsDirty();

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual({ answer: 5, comment: 'edited' });
    });
  });

  describe('isDisplayOnly()', () => {
    it('should be true when reviewer has canAnswer false', () => {
      component.doReview = true;
      component.doAssessment = false;
      component.question = { ...component.question, canAnswer: false };
      expect(component.isDisplayOnly).toBeTrue();
    });

    it('should be true when status is feedback available', () => {
      component.doAssessment = false;
      component.doReview = false;
      component.submissionStatus = 'feedback available';
      expect(component.isDisplayOnly).toBeTrue();
    });

    it('should be false when doing assessment', () => {
      component.doAssessment = true;
      component.doReview = false;
      expect(component.isDisplayOnly).toBeFalse();
    });
  });

  describe('hasSubmissionAnswer / hasReviewAnswer / hasAnyAnswer', () => {
    it('hasSubmissionAnswer returns true when answer exists', () => {
      component.submission = { answer: 3 };
      expect(component.hasSubmissionAnswer()).toBeTrue();
    });

    it('hasSubmissionAnswer returns false when answer is null', () => {
      component.submission = { answer: null };
      expect(component.hasSubmissionAnswer()).toBeFalse();
    });

    it('hasReviewAnswer returns true when review answer exists', () => {
      component.review = { answer: 4 };
      expect(component.hasReviewAnswer()).toBeTrue();
    });

    it('hasReviewAnswer returns false when review answer is null', () => {
      component.review = { answer: null };
      expect(component.hasReviewAnswer()).toBeFalse();
    });

    it('hasAnyAnswer returns true when either exists', () => {
      component.submission = { answer: 3 };
      component.review = { answer: null };
      expect(component.hasAnyAnswer()).toBeTrue();
    });

    it('hasAnyAnswer returns false when neither exists', () => {
      component.submission = { answer: null };
      component.review = { answer: null };
      expect(component.hasAnyAnswer()).toBeFalse();
    });
  });

  describe('onLabelClick guard', () => {
    it('should not call onChange when control is disabled', () => {
      component.ngOnInit();
      component.control.disable();
      spyOn(component, 'onChange');

      component.onLabelClick(0);

      expect(component.onChange).not.toHaveBeenCalled();
    });
  });

  describe('writeValue()', () => {
    it('should set innerValue from value', () => {
      component.writeValue({ answer: 3, comment: 'test' });
      expect(component.innerValue).toEqual({ answer: 3, comment: 'test' });
      expect(component.comment).toBe('test');
    });

    it('should not crash on null', () => {
      const prevValue = component.innerValue;
      component.writeValue(null);
      expect(component.innerValue).toEqual(prevValue);
    });
  });

  describe('registerOnChange / registerOnTouched', () => {
    it('should store propagateChange function', () => {
      const fn = jasmine.createSpy();
      component.registerOnChange(fn);
      component.propagateChange('test');
      expect(fn).toHaveBeenCalledWith('test');
    });

    it('registerOnTouched should not throw', () => {
      expect(() => component.registerOnTouched(() => {})).not.toThrow();
    });
  });

  describe('audienceContainReviewer()', () => {
    it('should return true when multiple audiences include reviewer', () => {
      component.question = { ...component.question, audience: ['submitter', 'reviewer'] };
      expect(component.audienceContainReviewer()).toBeTrue();
    });

    it('should return false for single audience', () => {
      component.question = { ...component.question, audience: ['submitter'] };
      expect(component.audienceContainReviewer()).toBeFalse();
    });
  });

  it('should leave the existing range unchanged for a non-slider question', () => {
    const generatedChoices = [{ id: 10, name: '10' }];
    component.sliderMin = 10;
    component.sliderMax = 20;
    component.generatedChoices = generatedChoices;
    component.question = { ...component.question, type: 'text', min: undefined, max: undefined };

    component.ngOnInit();

    expect(component.sliderMin).toBe(10);
    expect(component.sliderMax).toBe(20);
    expect(component.generatedChoices).toBe(generatedChoices);
  });

  it('should fall back to the minimum for non-numeric saved slider answers', () => {
    component.sliderMin = 2;
    component.submission = { answer: 'invalid' };
    component.innerValue = { answer: 'invalid' };

    expect(component.getSubmissionSliderValue()).toBe(2);
    expect(component.getReviewSliderValue()).toBe(2);
  });
});
