import { Component, Input, forwardRef, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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

  @Input() question;
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

  constructor() {}

  ngOnInit() {
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
    if (!this.innerValue) return 0;
    const index = this.question.choices.findIndex(choice => choice.id === this.innerValue);
    return index >= 0 ? index : 0;
  }

  onSliderChange(event: any): void {
    const sliderValue = event.detail.value;
    const selectedChoice = this.question.choices[sliderValue];
    if (selectedChoice) {
      this.onChange(selectedChoice.id);
    }
  }

  onLabelClick(index: number): void {
    if (!this.control.disabled) {
      const selectedChoice = this.question.choices[index];
      if (selectedChoice) {
        this.onChange(selectedChoice.id);
      }
    }
  }

  getSelectedChoiceLabel(choiceId?: any): string {
    const targetValue = choiceId || this.innerValue;
    if (!targetValue) return '';
    const selectedChoice = this.question.choices.find(choice => choice.id === targetValue);
    return selectedChoice ? selectedChoice.name : '';
  }

  getChoiceNameById(choiceId: any): string {
    if (!choiceId) return '';
    const choice = this.question.choices.find(c => c.id === choiceId);
    return choice ? choice.name : '';
  }

  // Get slider value for submission (learner's answer)
  getSubmissionSliderValue(): number {
    if (!this.submission?.answer) return 0;
    const index = this.question.choices.findIndex(choice => choice.id === this.submission.answer);
    return index >= 0 ? index : 0;
  }

  // Get slider value for review (expert's answer)
  getReviewSliderValue(): number {
    if (!this.innerValue?.answer) return 0;
    const index = this.question.choices.findIndex(choice => choice.id === this.innerValue.answer);
    return index >= 0 ? index : 0;
  }

  // Handle review slider changes
  onReviewSliderChange(event: any): void {
    const sliderValue = event.detail.value;
    const selectedChoice = this.question.choices[sliderValue];
    if (selectedChoice) {
      this.onChange(selectedChoice.id, 'answer');
    }
  }

  // Handle review label clicks
  onReviewLabelClick(index: number): void {
    if (!this.control.disabled) {
      const selectedChoice = this.question.choices[index];
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
    const choice = this.question.choices[value];
    return choice ? choice.name : '';
  };
}
