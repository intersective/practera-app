import { Component, Input } from '@angular/core';
import { FilestackService } from '@shared/filestack/filestack.service';

@Component({
  selector: 'app-file-display',
  templateUrl: 'file-display.component.html',
  styleUrls: ['file-display.component.scss']
})
export class FileDisplayComponent {

  @Input() fileType = 'any';
  @Input() file: any;

  constructor( private filestackService: FilestackService ) {}
  async previewFile(file) {
    return await this.filestackService.previewFile(file);
  }
}
