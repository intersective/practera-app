import { Component, Input, forwardRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, AbstractControl } from '@angular/forms';
import { UtilsService } from '@v3/app/services/utils.service';
import { Subject } from 'rxjs';
import { Question } from '../types/assessment';

@Component({
  standalone: false,
  selector: 'app-multi-team-member-selector',
  templateUrl: 'multi-team-member-selector.component.html',
  styleUrls: ['multi-team-member-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MultiTeamMemberSelectorComponent),
    }
  ]
})
export class MultiTeamMemberSelectorComponent implements ControlValueAccessor, OnInit {
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
  @Input() control: AbstractControl<{answer: string[], comment: string}>;
  // answer field for submitter & reviewer
  @ViewChild('answerEle') answerRef: ElementRef;
  // comment field for reviewer
  @ViewChild('commentEle') commentRef: ElementRef;

  // the value of answer
  innerValue: any;
  comment: string;
  // validation errors array
  errors: Array<any> = [];

  constructor(
    private utils: UtilsService
  ) {}

  ngOnInit() {
    this._showSavedAnswers();
  }
  // propagate changes into the form control
  propagateChange = (_: any) => {};

  triggerSave() {
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


  // event fired when radio is selected. propagate the change up to the form control using the custom value accessor interface
  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(value, type?: string) {
    // set changed value (answer or comment)
    if (type) {
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
        // ensure answer is always an array before toggling
        if (!Array.isArray(this.innerValue.answer)) {
          this.innerValue.answer = [];
        }
        this.innerValue.answer = this.utils.addOrRemove(this.innerValue.answer, value);
      }
    } else {
      this.innerValue = this.utils.addOrRemove(this.innerValue, value);
    }

    // propagate value into form control using control value accessor interface
    this.propagateChange(this.innerValue);

    // reset errors
    this.errors = [];
    // setting, resetting error messages into an array (to loop) and adding the validation messages to show below the answer area
    if (this.control?.errors) {
      for (const key in this.control.errors) {
        if (key === 'required') {
          this.errors.push('This question is required');
        } else {
          this.errors.push(this.control.errors[key]);
        }
      }
    }

    this.triggerSave();
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {
    if (value) {
      this.innerValue = value;
      // ensure answer is always an array for checkbox questions in review mode
      if (this.doReview && this.innerValue && !Array.isArray(this.innerValue.answer)) {
        this.innerValue = { ...this.innerValue, answer: [] };
      }
      // in assessment mode, innerValue must be a plain array
      if (this.doAssessment && !Array.isArray(this.innerValue)) {
        this.innerValue = Array.isArray(this.innerValue?.answer) ? this.innerValue.answer : [];
      }
      if (value.comment !== undefined) {
        this.comment = value.comment;
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
    if ((['in progress', 'not start'].includes(this.reviewStatus)) && this.doReview && this.review) {
      // preserve user edits across pagination; fall back to saved review data
      if (this.control && !this.control.pristine) {
        this.innerValue = this.control.value;
        // ensure answer is always an array for checkbox questions
        if (!Array.isArray(this.innerValue?.answer)) {
          this.innerValue = { ...this.innerValue, answer: [] };
        }
        this.comment = this.control.value?.comment ?? this.review.comment;
      } else {
        this.innerValue = {
          answer: Array.isArray(this.review.answer) ? this.review.answer : [],
          comment: this.review.comment || '',
        };
        this.comment = this.review.comment;
      }
    } else if ((this.submissionStatus === 'in progress') && this.doAssessment) {
      // in assessment mode, innerValue is a plain array (not an object)
      if (this.control && !this.control.pristine) {
        this.innerValue = this.control.value;
      } else {
        this.innerValue = this.submission?.answer || [];
      }
    }

    this.propagateChange(this.innerValue);
  }

  // check question audience have more that one audience and is it includes reviewer as audience.
  // then will identify it as a student and mentor answering in the same question and
  // border need to add only for mentor section not for full question
  audienceContainReviewer() {
    return this.question.audience.length > 1 && this.question.audience.includes('reviewer');
  }

  get isDisplayOnly(): boolean {
    // reviewer can still see the question if it is not answerable
    if (this.doReview === true && this.question?.canAnswer === false) {
      return true;
    }

    return !this.doAssessment && !this.doReview && (this.submissionStatus === 'feedback available' || this.submissionStatus === 'pending review' || (this.submissionStatus === 'done' && this.reviewStatus === '')) && (this.submission?.answer || this.review?.answer);
  }

  /**
   * checks if a team member is selected using the local working state (innerValue).
   * reads from innerValue.answer in review mode, or innerValue directly in assessment mode.
   * used in both doAssessment and doReview templates for checkbox [checked] binding
   * so that user edits persist across pagination (unlike isSelectedInReview which
   * reads from the stale @Input review data).
   */
  isSelected(teamMember: any): boolean {
    if (!this.innerValue) return false;
    if (this.doReview && !this.innerValue.answer) return false;
    if (this.doAssessment && !this.innerValue) return false;

    try {
      const answer = this.doReview ? this.innerValue.answer : this.innerValue;
      const memberObj = JSON.parse(teamMember.key);
      return answer.some((ans: string) => {
        try {
          const ansObj = JSON.parse(ans);
          return ansObj.userId === memberObj.userId;
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }

  /**
   * checks if a team member was selected in the learner's original submission.
   * reads from @Input submission.answer (api data, never modified locally).
   * used only for displaying the "Learner's Answer" badge in review mode.
   */
  isSelectedInSubmission(teamMember: any): boolean {
    if (!this.submission?.answer) return false;
    try {
      const memberObj = JSON.parse(teamMember.key);
      return this.submission.answer.some((ans: string) => {
        try {
          const ansObj = JSON.parse(ans);
          return ansObj.userId === memberObj.userId;
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }

  /**
   * checks if a team member was selected in the reviewer's original review.
   * reads from @Input review.answer (api data, never modified locally).
   * used only in isDisplayOnly (read-only) mode for the "Reviewer's Answer" badge.
   * not used for checkbox [checked] binding — use isSelected() instead to
   * preserve local edits across pagination.
   */
  isSelectedInReview(teamMember: any): boolean {
    if (!this.review?.answer) return false;
    try {
      const memberObj = JSON.parse(teamMember.key);
      return this.review.answer.some((ans: string) => {
        try {
          const ansObj = JSON.parse(ans);
          return ansObj.userId === memberObj.userId;
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }

  // innerHTML toggle label click handler
  onLabelToggle = (id: string): void => {
    this.onChange(id);
  }

  onLabelToggleReview = (id: string): void => {
    this.onChange(id, 'answer');
  }
}
