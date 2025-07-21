import { Component, Input, forwardRef, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, AbstractControl, ControlValueAccessor } from '@angular/forms';
import { IonTextarea } from '@ionic/angular';
import { Question } from '@v3/services/assessment.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

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
export class TextComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @Input() submitActions$: Subject<any>;
  subcriptions: Subscription[] = [];

  @Input() question: Question;
  @Input() submission;
  @Input() submissionId?: number;
  @Input() review;
  @Input() reviewId?: number;
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
  @ViewChild('answerEle') answerRef: IonTextarea;
  // comment field for reviewer
  @ViewChild('commentEle') commentRef: ElementRef;

  // the value of answer &| comment
  innerValue: any;
  answer: FormControl;
  comment: FormControl;
  // validation errors array
  errors: Array<any> = [];

  constructor() {}

  ngOnInit() {
    this._showSavedAnswers();
  }

  triggerSave(): void {
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
        answer: this.answer,
      };
    }

    this.submitActions$.next(action);
  }

  ngAfterViewInit() {
    if (this.answerRef?.ionInput) {
      this.subcriptions.push(this.answerRef.ionInput.pipe(
        map(e => (e.target as HTMLInputElement).value),
        filter(text => text.length >= 0),
        debounceTime(800),
        distinctUntilChanged(),
      ).subscribe(_answer => {
        return this.triggerSave();
      }));
    }
  }

  ngOnDestroy() {
    this.subcriptions.forEach(subscription => {
      if (!subscription.closed) {
        subscription.unsubscribe();
      }
    });
  }

  // propagate changes into the form control
  propagateChange = (_: any) => {};

  // fix IE/Edge text reversal issue
  public onFocus(event) {
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
  onChange(type: 'answer' | 'comment' = null) {
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

    this.propagateChange(this.innerValue);
    return ;
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
    if (['in progress', 'not start'].includes(this.reviewStatus) && this.doReview) {
      this.innerValue = {
        answer: [],
        comment: ''
      };
      this.innerValue.comment = this.review.comment;
      this.comment = this.review.comment;
      this.innerValue.answer = this.review.answer;
      this.answer = this.review.answer;
    } else if ((this.submissionStatus === 'in progress') && this.doAssessment) {
      this.answer = this.control.pristine ? this.submission.answer : this.control.value;
      this.innerValue = this.answer;
    }

    this.propagateChange(this.control.value || this.innerValue);
    this.control.setValue(this.control.value || this.innerValue);
  }

  // check question audience have more that one audience and is it includes reviewer as audience.
  // then will identify it as a student and mentor answering in the same question and
  // border need to add only for mentor section not for full question
  audienceContainReviewer() {
    return this.question.audience.length > 1 && this.question.audience.includes('reviewer');
  }

}
