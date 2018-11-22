import { Component, OnInit, Input, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { FilestackService } from '@shared/filestack/filestack.service';

@Component({
  selector: 'app-q-file',
  templateUrl: 'q-file.component.html',
  styleUrls: ['q-file.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => QFileComponent),
    }
  ]
})
export class QFileComponent implements ControlValueAccessor, OnInit {

  @Input() question: {
    fileType: 'any'
  };
  @Input() submission: {};
  @Input() review: {};
  // this is for doing an assessment or not
  @Input() doAssessment: Boolean;
  // this is for doing review or not
  @Input() doReview: Boolean;
  // FormControl that is passed in from parent component
  @Input() control: FormControl;
  // answer field for submitter & reviewer
  @ViewChild('answer') answerRef: ElementRef;
  // comment field for reviewer
  @ViewChild('comment') commentRef: ElementRef;

  uploadedFiles: Array<any> = [];
  fileTypes = '';

  // the value of answer
  innerValue: any;
  // validation errors array
  errors: Array<any> = [];

  constructor(
    private filestackService: FilestackService
  ) {}

  ngOnInit() {
    this.fileTypes = this.filestackService.getFileTypes(this.question.fileType);
  }

  //propagate changes into the form control
  propagateChange = (_: any) => {}

  onFileUploadCompleted(file, type = null) {
    if (file.success) {
      // reset errors 
      this.errors = [];
      this.uploadedFiles.push(file.data);
      this.onChange(type);
    } else {
      // display error message for user
      this.errors.push('File upload failed, please try again later.');
    }
  }

  // event fired when file is uploaded. propagate the change up to the form control using the custom value accessor interface
  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(type, value = ''){
    //set changed value (answer or comment)
    if (type) {
      if (!this.innerValue) {
        this.innerValue = {
          answer: [],
          comment: ''
        };
      }
      if (type == 'comment') {
        // just pass the value for comment since comment is always just text
        this.innerValue.comment = value;
      } else {
        this.innerValue.answer = this.uploadedFiles;
      }
    } else {
      // this is for submitter, just pass the uploaded file as the answer
      this.innerValue = this.uploadedFiles;
    }

    // propagate value into form control using control value accessor interface
    this.propagateChange(this.innerValue);
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    if (value) {
      this.innerValue = value;
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {

  }

}