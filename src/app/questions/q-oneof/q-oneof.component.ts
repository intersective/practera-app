import { Component, Input, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';

@Component({
  selector: 'app-q-oneof',
  templateUrl: 'q-oneof.component.html',
  styleUrls: ['q-oneof.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => QOneofComponent),
    }
  ]
})
export class QOneofComponent implements ControlValueAccessor {

  @Input() question: {};
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

  // the value of answer
  innerValue = '';
  // validation errors array
  errors: Array<any> = [];

  constructor() {}

  ngAfterViewInit() {
  }

  //propagate changes into the form control
  propagateChange = (_: any) => {}

  // event fired when radio is selected. propagate the change up to the form control using the custom value accessor interface
  onChange(value, type){
    //set changed value (answer or comment)
    if (type) {
      let innerValueObj = {};
      if (this.innerValue) {
        innerValueObj = JSON.parse(this.innerValue);
      } 
      innerValueObj[type] = value;
      this.innerValue = JSON.stringify(innerValueObj);
    } else {
      this.innerValue = value;
    }

    // propagate value into form control using control value accessor interface
    this.propagateChange(this.innerValue);

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
    this.innerValue = value;
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {

  }

}