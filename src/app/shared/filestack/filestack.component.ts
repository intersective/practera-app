declare var filestack;
import { Subscription } from 'rxjs/Subscription';
import { Component, HostListener, ElementRef, Renderer, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { FilestackService } from "./filestack.service";

@Component({
  selector: "file-stack",
  template: "<ng-content></ng-content>"
})
export class FilestackComponent implements OnInit, OnDestroy {
  private el: HTMLElement;
  @Input("data-accept")
  private dataFormat: any;
  @Output("complete")
  private output: EventEmitter<any> = new EventEmitter();
  private filestackSubscriber: Subscription;

  constructor(
    private _elementRef: ElementRef, 
    private _renderer: Renderer, 
    private filestackService: FilestackService
  ) {
    this.el = _elementRef.nativeElement;
  }

  ngOnInit() {}

  //open filestack on click event
  @HostListener("click", ['$event'])

  onFileStackFieldClick(event: MouseEvent) {
    let accept = (this.dataFormat || "").split(",");
    let maxFiles = this.el.getAttribute("data-maxfiles");
    if (this.filestackSubscriber) {
      this.filestackSubscriber.unsubscribe();
      this.filestackSubscriber = null;
    }
    let filestackConfig = this.filestackService.getFilestackConfig().key;
    let fileStackClient = filestack.init(filestackConfig, { policy: 'policy', signature: 'signature' });
    let s3Config = this.filestackService.getS3Config();
    fileStackClient.pick({
      accept: accept,
      maxFiles: parseInt(maxFiles),
      fromSources: [
        'local_file_system',
        'googledrive',
        'dropbox',
        'gmail',
        'video'
      ],
      storeTo: s3Config,
      onFileSelected: function(file) {
        return file;
      }
    })
    .then((result: any) => {
      if (result.filesFailed.length > 0) {
        this.output.emit({
          success: false,
          data: result.filesFailed
        });
      }
      else {
        result.filesUploaded = result.filesUploaded || [];
        this.output.emit({
          success: true,
          data: result.filesUploaded
        });
      }
    });
  }
  ngOnDestroy() {
    if (this.filestackSubscriber) {
      this.filestackSubscriber.unsubscribe();
      this.filestackSubscriber = null;
    }
  }
}