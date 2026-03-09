import { Component, Input, forwardRef, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Question } from '../types/assessment';

@Component({
  selector: 'app-slider',
  templateUrl: 'slider.component.html',
  styleUrls: ['./slider.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SliderComponent),
    }
  ]
})
export class SliderComponent implements AfterViewInit, ControlValueAccessor, OnInit {
  @Input() submitActions$: Subject<any>;

  @Input() question: Question;
  @Input() submission;
  @Input() submissionId: number;
  @Input() review;
  @Input() reviewId: number;
  // this is for review status
  @Input() reviewStatus;
  // this is for assessment status
  @Input() submissionStatus;
  // this is for doing an assessment or not
  @Input() doAssessment: Boolean;
  // this is for doing review or not
  @Input() doReview: Boolean;
  // FormControl that is passed in from parent component
  @Input() control: AbstractControl;

  // the value of answer
  innerValue: any;
  comment: string;
  // validation errors array
  errors: Array<any> = [];

  autosave$ = new Subject<void>();

  // Properties for slider support
  sliderMin = 0;
  sliderMax = 100;
  generatedChoices: Array<{id: number, name: string}> = [];

  constructor() {}

  ngOnInit() {
    if (this.question.type === 'slider' && (this.question.min !== undefined || this.question.max !== undefined)) {
      this.sliderMin = Number(this.question.min);
      this.sliderMax = Number(this.question.max);

      // Generate choices from min/max range
      this.generatedChoices = [];
      for (let i = this.sliderMin; i <= this.sliderMax; i++) {
        this.generatedChoices.push({
          id: i,
          name: i.toString()
        });
      }
    }

    this._showSavedAnswers();
  }

  ngAfterViewInit() {
    this.autosave$.pipe(
      debounceTime(800),
    ).subscribe(() => {
      this.triggerSave();
    });
  }

  // propagate changes into the form control
  propagateChange = (_: any) => {};

  // event fired when slider value changes. propagate the change up to the form control using the custom value accessor interface
  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(value, type?: string) {
    // set changed value (answer or comment)
    if (type) {
      // initialise innerValue if not set
      if (!this.innerValue) {
        this.innerValue = {
          answer: '',
          comment: ''
        };
      }
      this.innerValue[type] = value;
    } else {
      this.innerValue = value;
    }

    // propagate value into form control using control value accessor interface
    this.propagateChange(this.innerValue);

    // reset errors
    this.errors = [];
    // setting, resetting error messages into an array (to loop) and adding the validation messages to show below the answer area
    for (const key in this.control.errors) {
      if (key === 'required') {
        this.errors.push('This question is required');
      } else {
        this.errors.push(this.control.errors[key]);
      }
    }

    this.autosave$.next();
  }

  triggerSave(): void {
    const action: {
      saveInProgress?: boolean;
      autoSave?: boolean;
      goBack?: boolean;
      questionSave?: {};
      reviewSave?: {};
    } = {
      saveInProgress: true,
      autoSave: true,
      goBack: false,
    };

    if (this.doReview === true) {
      action.reviewSave = {
        reviewId: this.reviewId,
        submissionId: this.submissionId,
        questionId: this.question.id,
        answer: this.innerValue.answer,
        comment: this.innerValue.comment,
      };
    }

    if (this.doAssessment === true) {
      action.questionSave = {
        submissionId: this.submissionId,
        questionId: this.question.id,
        answer: this.innerValue,
      };
    }

    this.submitActions$.next(action);
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {
    if (value) {
      this.innerValue = value;
    }
  }

  // From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  // From ControlValueAccessor interface
  registerOnTouched(fn: any) {

  }

  // adding save values to from control
  private _showSavedAnswers() {
    if ((['in progress', 'not start'].includes(this.reviewStatus)) && this.doReview) {
      this.innerValue = {
        answer: '',
        comment: ''
      };
      this.innerValue.comment = this.review.comment;
      this.comment = this.review.comment;
      this.innerValue.answer = this.review.answer;
    }

    if ((this.submissionStatus === 'in progress') && this.doAssessment) {
      this.innerValue = this.control.pristine ? this.submission.answer : this.control.value;
    }

    this.propagateChange(this.innerValue);
  }

  // check question audience have more that one audience and is it includes reviewer as audience.
  // then will identify it as a student and mentor answering in the same question and
  // border need to add only for mentor section not for full question
  audienceContainReviewer() {
    return this.question.audience.length > 1 && this.question.audience.includes('reviewer');
  }

  /**
   * This method checking is passed choice id is the selected answer.
   * innerValue is the question answer
   * @param choiceId question choice ID
   */
  checkInnerValue(choiceId) {
    if (!choiceId) {
      return;
    }
    if (choiceId === this.innerValue) {
      return true;
    }
  }

  get isDisplayOnly(): boolean {
    if (this.doReview === true && this.question?.canAnswer === false) {
      return true;
    }

    return !this.doAssessment && !this.doReview && (this.submissionStatus === 'feedback available' || this.submissionStatus === 'pending review' || (this.submissionStatus === 'done' && this.reviewStatus === ''));
  }

  // Likert slider functionality methods
  getSliderValue(): number {
    if (!this.innerValue) return this.sliderMin;

    return typeof this.innerValue === 'number' ? this.innerValue : this.sliderMin;
  }

  onSliderChange(event: any): void {
    const sliderValue = event.detail.value;
    this.onChange(sliderValue);
  }

  onLabelClick(index: number): void {
    if (!this.control.disabled && this.generatedChoices.length) {
      const selectedChoice = this.generatedChoices[index];
      if (selectedChoice) {
        this.onChange(selectedChoice.id);
      }
    }
  }

  getSelectedChoiceLabel(choiceId?: any): string {
    const targetValue = choiceId || this.innerValue;
    if (!targetValue) return '';

    return targetValue.toString();
  }

  getChoiceNameById(choiceId: any): string {
    if (!choiceId) return '';

    return choiceId.toString();
  }

  // Get slider value for submission (Learner answer)
  getSubmissionSliderValue(): number {
    if (!this.submission?.answer) return this.sliderMin;

    return typeof this.submission.answer === 'number' ? this.submission.answer : this.sliderMin;
  }

  // Get slider value for review (Reviewer answer)
  getReviewSliderValue(): number {
    if (!this.innerValue?.answer) return this.sliderMin;

    return typeof this.innerValue.answer === 'number' ? this.innerValue.answer : this.sliderMin;
  }

  // Handle review slider changes
  onReviewSliderChange(event: any): void {
    const sliderValue = event.detail.value;
    this.onChange(sliderValue, 'answer');
  }

  onReviewLabelClick(index: number): void {
    if (!this.control.disabled && this.generatedChoices.length) {
      const selectedChoice = this.generatedChoices[index];
      if (selectedChoice) {
        this.onChange(selectedChoice.id, 'answer');
      }
    }
  }

  // Check if choice is selected in review mode
  checkReviewValue(choiceId: any): boolean {
    if (!choiceId || !this.innerValue?.answer) {
      return false;
    }
    return choiceId === this.innerValue.answer;
  }

  pinFormatter = (value: number): string => {
    return value.toString();
  };

  // helper methods to check if answers exist
  hasSubmissionAnswer(): boolean {
    return this.submission?.answer !== null && this.submission?.answer !== undefined;
  }

  hasReviewAnswer(): boolean {
    return this.review?.answer !== null && this.review?.answer !== undefined;
  }

  hasAnyAnswer(): boolean {
    return this.hasSubmissionAnswer() || this.hasReviewAnswer();
  }
}
