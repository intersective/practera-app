import { Component, Input, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-q-multiple',
  templateUrl: 'q-multiple.component.html',
  styleUrls: ['q-multiple.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => QMultipleComponent),
    }
  ]
})
export class QMultipleComponent implements ControlValueAccessor {

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

  constructor(
    private utils: UtilsService
  ) {}

  ngAfterViewInit() {
  }

  //propagate changes into the form control
  propagateChange = (_: any) => {}

  // event fired when checkbox is selected/unselected. propagate the change up to the form control using the custom value accessor interface
  onChange(value, type){
    let position;
    //set changed value (answer or comment)
    if (type) {
      let innerValueObj = {};
      if (this.innerValue != "") {
        innerValueObj = JSON.parse(this.innerValue);
      }
      if (type == 'comment') {
        // just pass the value for comment since comment is always just text
        innerValueObj[type] = value;
      } else {
        if (!innerValueObj[type]) {
          innerValueObj[type] = [];
        }
        position = this.utils.indexOf(innerValueObj[type], value);
        if (position > -1) {
          // find the position of this value and remove it
          innerValueObj[type].splice(position, 1);
        } else {
          // add it to the value array
          innerValueObj[type].push(value);
        }
      }
      this.innerValue = JSON.stringify(innerValueObj);
    } else {
      let innerValueArray = [];
      if (this.innerValue != "") {
        innerValueArray = JSON.parse(this.innerValue);
      }
      position = this.utils.indexOf(innerValueArray, value);
      if (position > -1) {
        // find the position of this value and remove it
        innerValueArray.splice(position, 1);
      } else {
        // add it to the value array
        innerValueArray.push(value);
      }
      this.innerValue = JSON.stringify(innerValueArray);
    }

    // propagate value into form control using control value accessor interface
    this.propagateChange(JSON.parse(this.innerValue));

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
      this.innerValue = JSON.stringify(value);
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