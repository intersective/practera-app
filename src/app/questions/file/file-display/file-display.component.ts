import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-file-display',
  templateUrl: 'file-display.component.html',
  styleUrls: ['file-display.component.scss']
})
export class FileDisplayComponent {

  @Input() fileType = 'any';
  @Input() file: any;

  constructor() {}

}