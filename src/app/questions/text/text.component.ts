import { Component, Input, forwardRef, ViewChild, ElementRef } from '@angular/core';
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
export class TextComponent implements ControlValueAccessor {

  @Input() question;
  @Input() submission;
  @Input() review;
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

  // the value of answer &| comment
  innerValue: any;
  answer: string;
  comment: string;
  // validation errors array
  errors: Array<any> = [];

  constructor() {}

  ngAfterViewInit() {
  }

  //propagate changes into the form control
  propagateChange = (_: any) => {}

  // event fired when input/textarea value is changed. propagate the change up to the form control using the custom value accessor interface
  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(type){
    //set changed value (answer or comment)
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

    // 05/02/2019
    // Don't check "is required" error for now, it has some error.
    // Since we are checking required answer when submit, it's OK to just return here.
    return ;
    //reset errors
    this.errors = [];
    //setting, resetting error messages into an array (to loop) and adding the validation messages to show below the answer area
    for (var key in this.control.errors) {
      if (this.control.errors.hasOwnProperty(key)) {
        if(key === "required"){
          this.errors.push("This question is required");
        }else{
          this.errors.push(this.control.errors[key]);
        }
      }
    }
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
