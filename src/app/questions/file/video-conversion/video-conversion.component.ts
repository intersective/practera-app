import { Component, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FilestackService } from '@v3/app/services/filestack.service';
// import { UtilsService } from '@services/utils.service';
// import { environment } from '@environments/environment';

@Component({
  selector: 'app-video-conversion',
  templateUrl: 'video-conversion.component.html',
  styleUrls: ['video-conversion.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class VideoConversionComponent implements OnChanges {
  @Input() video?;
  @Input() roles?;
  @Output() preview = new EventEmitter();
  result = null;

  constructor(private filestackService: FilestackService) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('video::', this.video);
    if (this.video?.fileObject?.mimetype !== 'video/mp4') {
      this.convertVideo(this.video.fileObject);
    }
    console.log('mmm::', changes);
  }

  convertVideo(file) {
    this.filestackService.videoConversion(file.handle).subscribe(res => {
      this.result = res;
    });
  }

  showInFilestackPreview(file) {
    return this.filestackService.previewModal(file.data.url, {
      url: this.video.fileObject.url
      // url: file.data.url,
      // handle: this.video.fileObject.handle,
    });
    // return this.preview.emit(this.video.fileObject);
  }
}
