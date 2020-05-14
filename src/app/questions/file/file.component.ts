import { Component, OnInit, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { FilestackService } from '@shared/filestack/filestack.service';

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

  @Input() question = {
    name: '',
    description: '',
    isRequired: false,
    fileType: 'any'
  };
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
  @ViewChild('answer') answerRef: ElementRef;
  // comment field for reviewer
  @ViewChild('commentEle') commentRef: ElementRef;
  // call back for save changes
  @Output() saveProgress = new EventEmitter<boolean>();

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
    this.fileTypes = this.filestackService.getFileTypes(this.question.fileType);
    this._showSavedAnswers();
  }

  // propagate changes into the form control
  propagateChange = (_: any) => {};

  onFileUploadCompleted(file, type = null) {
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

  // event fired when file is uploaded. propagate the change up to the form control using the custom value accessor interface
  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(value, type) {
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
    this.saveProgress.emit(true);
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

  removeSubmitFile(data) {
    this.uploadedFile = null;
    this.submission.answer = null;
    this.onChange('', null);
  }

}
