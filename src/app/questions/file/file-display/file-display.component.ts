import { Component, Input, OnInit } from '@angular/core';
import { FilestackService } from '@shared/filestack/filestack.service';

@Component({
  selector: 'app-file-display',
  templateUrl: 'file-display.component.html',
  styleUrls: ['file-display.component.scss']
})
export class FileDisplayComponent implements OnInit {

  @Input() fileType = 'any';
  @Input() file: any;

  constructor( private filestackService: FilestackService ) {}

  ngOnInit() {
    console.log('this.file::', this.file);
    // this.filestackService.getWorkflowStatus(this.file.)
  }

  async previewFile(file) {
    try {
      return await this.filestackService.previewFile(file);
    } catch (err) {
      console.log(err);
    }
  }
}
