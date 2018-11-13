import { Component, Input, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';

@Component({
  selector: 'app-q-text',
  templateUrl: 'q-text.component.html',
  styleUrls: ['q-text.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => QTextComponent),
    }
  ]
})
export class QTextComponent implements ControlValueAccessor{

  @Input() question: {};
  @Input() submission: {};
  @Input() review: {};
  @Input() doAssessment: Boolean;
  @Input() doReview: Boolean;
  @Input() control: FormControl;
  @ViewChild('input') inputRef: ElementRef;

  constructor() {}

  //From ControlValueAccessor interface
  writeValue(value: any) {
      
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
      
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {

  }

}