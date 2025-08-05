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

    // Mock question data
    component.question = {
      id: 1,
      name: 'Test Slider Question',
      choices: [
        { id: 1, name: 'Strongly Disagree' },
        { id: 2, name: 'Disagree' },
        { id: 3, name: 'Neutral' },
        { id: 4, name: 'Agree' },
        { id: 5, name: 'Strongly Agree' }
      ],
      audience: ['submitter']
    };

    component.control = new FormControl();
    component.submitActions$ = new Subject();
    component.doAssessment = true;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct slider value', () => {
    component.innerValue = 3; // ID of 'Neutral'
    expect(component.getSliderValue()).toBe(2); // Index of 'Neutral'
  });

  it('should handle slider change', () => {
    const event = { detail: { value: 1 } };
    spyOn(component, 'onChange');

    component.onSliderChange(event);

    expect(component.onChange).toHaveBeenCalledWith(2); // ID of 'Disagree'
  });

  it('should handle label click', () => {
    spyOn(component, 'onChange');

    component.onLabelClick(0);

    expect(component.onChange).toHaveBeenCalledWith(1); // ID of 'Strongly Disagree'
  });

  it('should return correct selected choice label', () => {
    component.innerValue = 4; // ID of 'Agree'
    expect(component.getSelectedChoiceLabel()).toBe('Agree');
  });

  it('should format pin correctly', () => {
    expect(component.pinFormatter(3)).toBe('Agree');
  });

  it('should check inner value correctly', () => {
    component.innerValue = 2;
    expect(component.checkInnerValue(2)).toBe(true);
    expect(component.checkInnerValue(3)).toBeFalsy();
  });

  it('should return choice name by ID', () => {
    expect(component.getChoiceNameById(1)).toBe('Strongly Disagree');
    expect(component.getChoiceNameById(5)).toBe('Strongly Agree');
    expect(component.getChoiceNameById(999)).toBe('');
  });

  it('should get selected choice label with parameter', () => {
    expect(component.getSelectedChoiceLabel(2)).toBe('Disagree');
    expect(component.getSelectedChoiceLabel()).toBe('');
  });

  it('should get submission slider value', () => {
    component.submission = { answer: 4 };
    expect(component.getSubmissionSliderValue()).toBe(3); // Index of choice ID 4
  });

  it('should get review slider value', () => {
    component.innerValue = { answer: 5, comment: 'test' };
    expect(component.getReviewSliderValue()).toBe(4); // Index of choice ID 5
  });

  it('should handle review slider change', () => {
    const event = { detail: { value: 2 } };
    spyOn(component, 'onChange');

    component.onReviewSliderChange(event);

    expect(component.onChange).toHaveBeenCalledWith(3, 'answer'); // ID of choice at index 2
  });

  it('should handle review label click', () => {
    spyOn(component, 'onChange');

    component.onReviewLabelClick(1);

    expect(component.onChange).toHaveBeenCalledWith(2, 'answer'); // ID of choice at index 1
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
