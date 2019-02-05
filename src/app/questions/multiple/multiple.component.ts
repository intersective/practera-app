import { Component, Input, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-multiple',
  templateUrl: 'multiple.component.html',
  styleUrls: ['multiple.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MultipleComponent),
    }
  ]
})
export class MultipleComponent implements ControlValueAccessor {

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
  @ViewChild('answer') answerRef: ElementRef;
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

  ngAfterViewInit() {
  }

  //propagate changes into the form control
  propagateChange = (_: any) => {}

  // event fired when checkbox is selected/unselected. propagate the change up to the form control using the custom value accessor interface
  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(value, type){
    let position;
    //set changed value (answer or comment)
    if (type) {
      // initialise innerValue if not set
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
        this.innerValue.answer = this.utils.addOrRemove(this.innerValue.answer, value);
      }
    } else {
      if (!this.innerValue) {
        this.innerValue = [];
      }
      this.innerValue = this.utils.addOrRemove(this.innerValue, value);
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
