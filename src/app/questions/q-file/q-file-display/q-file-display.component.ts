import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-q-file-display',
  templateUrl: 'q-file-display.component.html',
  styleUrls: ['q-file-display.component.scss']
})
export class QFileDisplayComponent {

  @Input() fileType = 'any';
  @Input() file: any;

  constructor() {}

}