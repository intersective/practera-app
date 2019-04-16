import { Subscription } from 'rxjs/Subscription';
import { Component, HostListener, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FilestackService } from './filestack.service';

@Component({
  selector: 'file-stack',
  templateUrl: 'filestack.component.html',
  styleUrls: ['filestack.component.scss']
})
export class FilestackComponent implements OnInit {
  @Input() accept: any;
  @Input() fileType: string;
  @Output() complete: EventEmitter<any> = new EventEmitter();
  @Input() profileImage?: boolean;

  constructor(
    private filestackService: FilestackService
  ) {
  }

  ngOnInit() {}

  async uploadFile() {
    const s3Config = this.filestackService.getS3Config(this.fileType);
    const pickerOptions = {
      storeTo: s3Config,
      onFileUploadFailed: data => {
        this.complete.emit({
          success: false,
          data: data
        });
      },
      onFileUploadFinished: data => {
        this.complete.emit({
          success: true,
          data: data
        });
      }
    };

    if (this.accept) {
      pickerOptions['accept'] = this.accept;
    }

    return await this.filestackService.open(pickerOptions);
  }
}
