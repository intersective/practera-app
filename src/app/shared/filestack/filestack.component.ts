import * as filestack from 'filestack-js';
import { Subscription } from 'rxjs/Subscription';
import { Component, HostListener, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { FilestackService } from "./filestack.service";

@Component({
  selector: "file-stack",
  templateUrl: "filestack.component.html"
})
export class FilestackComponent implements OnInit, OnDestroy {
  @Input("accept") private fileTypes: any;
  @Output("complete") private output: EventEmitter<any> = new EventEmitter();
  private filestackSubscriber: Subscription;

  constructor(
    private filestackService: FilestackService
  ) {
  }

  ngOnInit() {}

  uploadFile() {
    if (this.filestackSubscriber) {
      this.filestackSubscriber.unsubscribe();
      this.filestackSubscriber = null;
    }
    let filestackConfig = this.filestackService.getFilestackConfig().key;
    const fileStackClient = filestack.init(filestackConfig);
    let s3Config = this.filestackService.getS3Config();
    let pickerOptions = {
      dropPane: {},
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

    fileStackClient.picker(pickerOptions)
      .open();
  }

  ngOnDestroy() {
    if (this.filestackSubscriber) {
      this.filestackSubscriber.unsubscribe();
      this.filestackSubscriber = null;
    }
  }
}