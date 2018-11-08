import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-q-text',
  templateUrl: 'q-text.component.html',
  styleUrls: ['q-text.component.scss']
})
export class QTextComponent {

  constructor() {}

  @Input() question: {};
  @Input() submission: {};
  @Input() review: {};
  @Input() doAssessment: Boolean;
  @Input() doReview: Boolean;

}