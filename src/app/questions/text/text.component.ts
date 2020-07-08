import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';

@Component({
  selector: 'app-text',
  templateUrl: 'text.component.html',
  styleUrls: ['text.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TextComponent),
    }
  ]
})
export class TextComponent implements ControlValueAccessor, OnInit {

  @Input() question;
  @Input() submission;
  @Input() review;
  // this is for review status
  @Input() reviewStatus;
  // this is for assessment status
  @Input() submissionStatus;
  // this is for doing an assessment or not
  @Input() doAssessment: Boolean;
  // this is for doing review or not
  @Input() doReview: Boolean;
  // FormControl that is passed in from parent component
  @Input() control: FormControl;
  // answer field for submitter & reviewer
  @ViewChild('answerEle') answerRef: ElementRef;
  // comment field for reviewer
  @ViewChild('commentEle') commentRef: ElementRef;
  // call back for save changes
  @Output() saveProgress = new EventEmitter<boolean>();

  // the value of answer &| comment
  innerValue: any;
  answer = '';
  comment: string;
  // validation errors array
  errors: Array<any> = [];

  constructor() {}

  ngOnInit() {
    this._showSavedAnswers();
  }

  // propagate changes into the form control
  propagateChange = (_: any) => {};

  // fix IE/Edge text reversal issue
  onFocus(event) {
    const isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    if (isIEOrEdge) {
      const textarea: HTMLTextAreaElement = event.target.firstChild;
      const existingText = textarea.value;
      if (textarea.value.length === 0) {
        textarea.value = 'a';
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        textarea.value = '';
      } else {
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        textarea.value = '';
        textarea.value = existingText;
      }
    }
  }


  // event fired when input/textarea value is changed. propagate the change up to the form control using the custom value accessor interface
  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(type = null) {
    // set changed value (answer or comment)
    if (type) {
      // initialise innerValue if not set
      if (!this.innerValue) {
        this.innerValue = {
          answer: '',
          comment: ''
        };
      }
      this.innerValue[type] = this[type];
    } else {
      this.innerValue = this.answer;
    }

    // propagate value into form control using control value accessor interface
    this.propagateChange(this.innerValue);

    this.saveProgress.emit(true);

    // 05/02/2019
    // Don't check "is required" error for now, it has some error.
    // Since we are checking required answer when submit, it's OK to just return here.
    return ;
    // reset errors
    // this.errors = [];
    // setting, resetting error messages into an array (to loop) and adding the validation messages to show below the answer area
    // for (const key in this.control.errors) {
    //   if (key === 'required') {
    //     this.errors.push('This question is required');
    //   } else {
    //     this.errors.push(this.control.errors[key]);
    //   }
    // }
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
    if ((this.reviewStatus === 'in progress') && (this.doReview)) {
      this.innerValue = {
        answer: [],
        comment: ''
      };
      this.innerValue.comment = this.review.comment;
      this.comment = this.review.comment;
      this.innerValue.answer = this.review.answer;
      this.answer = this.review.answer;
    }
    if ((this.submissionStatus === 'in progress') && (this.doAssessment)) {
      this.innerValue = this.submission.answer;
      this.answer = this.submission.answer;
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

}
