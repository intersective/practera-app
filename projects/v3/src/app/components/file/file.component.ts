import { Component, OnInit, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, AbstractControl } from '@angular/forms';
import { FilestackService } from '@v3/services/filestack.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-file',
  templateUrl: 'file.component.html',
  styleUrls: ['file.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FileComponent),
    }
  ]
})
export class FileComponent implements ControlValueAccessor, OnInit {
  @Input() submitActions$: Subject<any>;

  @Input() videoOnly?: boolean;
  @Input() question: {
    id: number;
    name: string;
    description: string;
    isRequired: boolean;
    fileType?: any,
    audience: any[],
    canAnswer: boolean;
    canComment: boolean;
  } = {
    id: null,
    name: '',
    description: '',
    isRequired: false,
    fileType: 'any',
    audience: [],
    canAnswer: false,
    canComment: false,
  };
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

  uploadedFile;
  fileTypes = '';

  // the value of answer
  innerValue: any;
  comment: string;
  // validation errors array
  errors: Array<any> = [];

  constructor(
    private filestackService: FilestackService
  ) {}

  ngOnInit() {
    this.fileTypes = this.filestackService.getFileTypes(this.videoOnly ? 'video' : this.question.fileType);
    this._showSavedAnswers();
  }

  // propagate changes into the form control
  propagateChange = (_: any) => {};

  onFileUploadCompleted(file, type:string = null) {
    if (file.success) {
      // reset errors
      this.errors = [];
      // currently we only support one file upload per question,
      // if we need to support multiple file upload later, we need to change this to:
      // this.uploadedFiles = push(file.data);
      this.uploadedFile = file.data;
      this.onChange('', type);
    } else {
      // display error message for user
      // if error is drag and drop error will show a custom message. ex:- nore than one file droped, invalid file type droped.
      if (file.data.isDragAndDropError) {
        this.errors.push(`${file.data.message}, please try again.`);
      } else {
        this.errors.push('File upload failed, please try again later.');
      }
    }
  }

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

  // event fired when file is uploaded. propagate the change up to the form control using the custom value accessor interface
  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(value, type: string) {
    // set changed value (answer or comment)
    if (type) {
      if (!this.innerValue) {
        this.innerValue = {
          answer: {},
          comment: ''
        };
      }
      if (type === 'comment') {
        // just pass the value for comment since comment is always just text
        this.innerValue.comment = value;
      } else {
        this.innerValue.answer = this.uploadedFile;
      }
    } else {
      // this is for submitter, just pass the uploaded file as the answer
      this.innerValue = this.uploadedFile;
    }

    // propagate value into form control using control value accessor interface
    this.propagateChange(this.innerValue);

    this.triggerSave();
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
    if ((['in progress', 'not start'].includes(this.reviewStatus)) && (this.doReview)) {
      this.innerValue = {
        answer: {},
        comment: ''
      };
      this.innerValue.comment = this.review.comment;
      this.comment = this.review.comment;
      this.innerValue.answer = this.review.answer;
    }
    if ((this.submissionStatus === 'in progress') && (this.doAssessment)) {
      this.innerValue = this.submission.answer;
    }
    this.propagateChange(this.innerValue);
    this.control.setValue(this.innerValue);
  }

  removeSubmitFile(file?: {
    handle: string;
  }): void {
    this.uploadedFile = null;

    if (this.doAssessment === true) {
      this.submission.answer = null;
      this.onChange('', null);
    }

    if (this.doReview === true) {
      this.review.answer = null;
      this.onChange('', 'answer');
    }


    // don't need to wait for deletion, just move on to
    // avoid negative effect on UX
    // eslint-disable-next-line no-console
    this.filestackService.deleteFile(file.handle).subscribe(console.log);
  }

  // check question audience flag have more that one audience value, and if it has include reviewer as one of the audiences.
  // then will identify it as a student and mentor answering in the same question and
  // border need to add only for mentor section not for full question
  audienceContainReviewer(): boolean {
    return this.question.audience.length > 1 && this.question.audience.includes('reviewer');
  }

}
