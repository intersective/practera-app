import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, AbstractControl } from '@angular/forms';
import { UtilsService } from '@v3/app/services/utils.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-multiple',
  templateUrl: 'multiple.component.html',
  styleUrls: ['multiple.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MultipleComponent),
    }
  ]
})
export class MultipleComponent implements ControlValueAccessor, OnInit {
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
  // answer field for submitter & reviewer
  @ViewChild('answer') answerRef: ElementRef;
  // comment field for reviewer
  @ViewChild('commentEle') commentRef: ElementRef;

  // the value of answer
  innerValue: any;
  comment: string;
  // validation errors array
  errors: Array<any> = [];

  constructor(
    private utils: UtilsService,
  ) {}

  ngOnInit() {
    this._showSavedAnswers();
  }

  // propagate changes into the form control
  propagateChange = (_: any) => {};

  /**
   * event fired when checkbox is toggled. propagate the change up to the form control using the custom value accessor interface
   *
   * 'type' will has value when a reviewer is editting the checkbox
   * 'type' is always undefined when a submitter doing assessment editting the checkbox
   *
   * @param value {string | number} choice.id or string
   * @param type {string} 'answer'/'comment'/undefined
   */
  onChange(value: string | number, type?: string) {
    // innerValue should be either array or object, if it is a string, parse it
    if (typeof this.innerValue === 'string') {
      this.innerValue = JSON.parse(this.innerValue);
    }

    // set changed value (answer or comment)
    if (type !== undefined) { // reviewer editting
      // initialise innerValue if not set
      if (!this.innerValue) {
        this.innerValue = {
          answer: [],
          comment: ''
        };
      }
      if (type === 'comment') {
        // just pass the value for comment since comment is always just text
        this.innerValue.comment = value;
      } else {
        this.innerValue.answer = this.utils.addOrRemove(this.innerValue.answer, value);
      }
    } else { // submitter editting
      if (!this.innerValue) {
        this.innerValue = [];
      }
      this.innerValue = this.utils.addOrRemove(this.innerValue, value);
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

    const action: {
      autoSave?: boolean;
      goBack?: boolean;
      questionSave?: {};
      reviewSave?: {};
    } = {
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
      this.innerValue = JSON.stringify(value);
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
    if ((['in progress', 'not start'].includes(this.reviewStatus)) && (this.doReview)) {
      this.innerValue = {
        answer: this.review.answer,
        comment: this.review.comment
      };
      this.comment = this.review.comment;
    }
    if ((this.submissionStatus === 'in progress') && (this.doAssessment)) {
      this.innerValue = this.submission.answer;
    }
    this.propagateChange(this.innerValue);
    this.control.setValue(this.innerValue);
  }

  // check question audience have more that one audience and is it includes reviewer as audience.
  // then will identify it as a student and mentor answering in the same question and
  // border need to add only for mentor section not for full question
  audienceContainReviewer() {
    return this.question.audience.length > 1 && this.question.audience.includes('reviewer');
  }

  /**
   * This method checking passed choice id is inside the answer array.
   * innerValue is the question answers and it's a array for checkbox questions
   * @param choiceId question choice ID
   */
  checkInnerValue(choiceId) {
    if (!choiceId) {
      return;
    }
    if (this.utils.indexOf(this.innerValue, choiceId) > -1) {
      return true;
    }
  }

  get isDisplayOnly(): boolean {
    if (this.doReview === true && this.question?.canAnswer === false) {
      return true;
    }

    return !this.doAssessment && !this.doReview && (this.submissionStatus === 'feedback available' || this.submissionStatus === 'pending review' || (this.submissionStatus === 'done' && this.reviewStatus === ''));
  }
}
