import { Component, Input, forwardRef, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, AbstractControl, ControlValueAccessor } from '@angular/forms';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Question } from '../types/assessment';

@Component({
  standalone: false,
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
export class TextComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() submitActions$: Subject<any>;
  private answerAutosave?: Subscription;

  @Input() question: Question;
  @Input() submission;
  @Input() submissionId?: number;
  @Input() review;
  @Input() reviewId?: number;
  @Input() reviewStatus;
  @Input() submissionStatus;
  @Input() doAssessment: Boolean;
  @Input() doReview: Boolean;
  @Input() viewerRole: 'learner' | 'reviewer';
  @Input() isReviewerFeedbackContext = false;
  @Input() control: AbstractControl;

  // Angular can replace the editable textarea while the question stays mounted.
  @ViewChild('answerEle', { read: ElementRef })
  private set answerRef(answer: ElementRef<HTMLElement> | undefined) {
    this.answerAutosave?.unsubscribe();
    this.answerAutosave = undefined;

    const textarea = answer?.nativeElement;
    if (!textarea) {
      return;
    }

    // Ionic 9 publishes textarea input as a native DOM event.
    this.answerAutosave = fromEvent<CustomEvent<{ value?: string | null }>>(textarea, 'ionInput').pipe(
      map(event => event.detail.value ?? ''),
      debounceTime(800),
      distinctUntilChanged(),
    ).subscribe(() => this.triggerSave());
  }

  // comment field for reviewer
  @ViewChild('commentEle') commentRef: ElementRef;

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

  ngOnDestroy() {
    this.answerAutosave?.unsubscribe();
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

  onChange(type?: 'answer' | 'comment') {
    if (this.doReview === true) { // review has both answer and comment
      if (!this.innerValue) {
        this.innerValue = {
          answer: '',
          comment: ''
        };
      }

      this.innerValue[type] = this[type];
    } else { // assessment has only answer
      this.innerValue = this.answer;
    }

    this.propagateChange(this.innerValue);
    return;
  }

  writeValue(value: any) {
    if (value) {
      this.innerValue = value;
      if (typeof value === 'object') {
        this.answer = value.answer;
        this.comment = value.comment;
      } else {
        this.answer = value;
      }
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
    if (['in progress', 'not start'].includes(this.reviewStatus) && this.doReview && this.review) {
      // when the control has been modified (e.g. user typed during pagination),
      // preserve their edits; otherwise use the saved review data
      if (this.control && !this.control.pristine) {
        this.answer = this.control.value?.answer ?? this.review.answer;
        this.comment = this.control.value?.comment ?? this.review.comment;
      } else {
        this.answer = this.review.answer;
        this.comment = this.review.comment;
      }

      this.innerValue = {
        answer: this.answer,
        comment: this.comment,
      };
    } else if ((this.submissionStatus === 'in progress') && this.doAssessment) {
      if (this.control) {
        this.answer = this.control.pristine ? this.submission?.answer : this.control.value;
      } else {
        this.answer = this.submission?.answer;
      }
      this.innerValue = this.answer;
    }

    this.propagateChange(this.innerValue);
    if (this.control) {
      this.control.setValue(this.innerValue);
    }
  }

  // check question audience have more that one audience and is it includes reviewer as audience.
  // then will identify it as a student and mentor answering in the same question and
  // border need to add only for mentor section not for full question
  audienceContainReviewer() {
    if (!this.question || !this.question.audience) {
      return false;
    }

    return this.question.audience.length > 1 && this.question.audience.includes('reviewer');
  }

}
