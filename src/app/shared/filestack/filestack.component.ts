import { Subscription } from 'rxjs/Subscription';
import { Component, HostListener, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FilestackService } from "./filestack.service";

@Component({
  selector: "file-stack",
  templateUrl: "filestack.component.html"
})
export class FilestackComponent implements OnInit {
  @Input("accept") private fileTypes: any;
  @Input("fileType") private fileType: string;
  @Output("complete") private output: EventEmitter<any> = new EventEmitter();

  constructor(
    private filestackService: FilestackService
  ) {
  }

  ngOnInit() {}

  async uploadFile() {
    let s3Config = this.filestackService.getS3Config(this.fileType);
    let pickerOptions = {
      fromSources: [
        'local_file_system',
        'googledrive',
        'dropbox',
        'gmail',
        'video'
      ],
      storeTo: s3Config,
      onFileUploadFailed: (data) => {
        this.output.emit({
          success: false,
          data: data
        });
      },
      onFileUploadFinished: (data) => {
        this.output.emit({
          success: true,
          data: data
        });
      }
    };

    if (this.fileTypes) {
      pickerOptions['accept'] = this.fileTypes;
    }

    return await this.filestackService.open(pickerOptions);
  }
}
