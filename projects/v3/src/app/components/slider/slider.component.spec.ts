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
    expect(component.getSelectedChoiceLabel()).toBe('');
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
      component.question.min = undefined;
      component.question.max = undefined;

      component.ngOnInit();

      expect(component.sliderMin).toBe(0);
      expect(component.sliderMax).toBe(100);
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
});
