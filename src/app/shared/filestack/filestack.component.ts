import { Subscription } from 'rxjs/Subscription';
import { Component, HostListener, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FilestackService } from './filestack.service';

@Component({
  selector: 'file-stack',
  templateUrl: 'filestack.component.html'
})
export class FilestackComponent implements OnInit {
  @Input() accept: any;
  @Input() fileType: string;
  @Output() complete: EventEmitter<any> = new EventEmitter();

  constructor(
    private filestackService: FilestackService
  ) {
  }

  ngOnInit() {}

  async uploadFile() {
    const s3Config = this.filestackService.getS3Config(this.fileType);
    const pickerOptions = {
      fromSources: [
        'local_file_system',
        'googledrive',
        'dropbox',
        'gmail',
        'video'
      ],
      storeTo: s3Config,
      onFileSelected: data => {
        // replace space with underscore '_' in file name
        data.filename = data.filename.replace(/ /g, '_');
        return data;
      },
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
