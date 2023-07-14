import { Component, Input, Output, OnInit, OnChanges, SimpleChanges , ViewChild, ElementRef, EventEmitter} from '@angular/core';
import { FilestackService } from '@v3/services/filestack.service';
import { UtilsService } from '@v3/services/utils.service';
import { environment } from '@v3/environments/environment';

@Component({
  selector: 'app-file-display',
  templateUrl: 'file-display.component.html',
  styleUrls: ['file-display.component.scss']
})
export class FileDisplayComponent implements OnInit, OnChanges {
  public virusDetection: {
    infected: boolean;
  } | any;
  private quarantine: any;

  @Input() fileType: string = 'any';
  @Input() file: any;
  @Input() isFileComponent?: boolean; // flag parent component is FileComponent
  @ViewChild('videoEle') videoEle: ElementRef;
  @Output() removeFile?: EventEmitter<any> = new EventEmitter();
  @Input() disabled?: boolean;
  @Input() lines?: string = 'full';

  constructor(
    private filestackService: FilestackService,
    private utils: UtilsService
  ) {
    this.file = { "filename": "pexels-startup-stock-photos-7096.jpg.png", "handle": "qICo2b4ARuGcuaw6xSSX", "mimetype": "image/png", "originalPath": "pexels-startup-stock-photos-7096.jpg", "size": 9324941, "source": "local_file_system", "url": "https://cdn.filestackcontent.com/qICo2b4ARuGcuaw6xSSX", "uploadId": "zQotOtl4RB715IYU", "originalFile": { "name": "pexels-startup-stock-photos-7096.jpg", "type": "image/jpeg", "size": 1511454 }, "status": "Stored", "key": "appv2/stage/uploads/undefined/N8qORD1vTcya3ykT1cuN_pexels-startup-stock-photos-7096.jpg.png", "container": "practera-aus", "cropped": { "originalImageSize": [5472, 3648], "cropArea": { "position": [0, 0], "size": [3648, 3648] } }, "workflows": { "3c38ef53-a9d0-4aa4-9234-617d9f03c0de": { "jobid": "c1a08144-d9c5-4c1f-8c3d-8e1f0fb1f38a" } } };
  }

  ngOnInit() {
    if (this.file && this.file.workflows) {
      this.updateWorkflowStatus();
    }
  }

  async updateWorkflowStatus(file?) {
    this._resetUILogic();
    // don't do virus detection on development environment
    if (!environment.production) {
      return ;
    }

    const currentFile = file || this.file;
    try {
      const responds = await this.filestackService.getWorkflowStatus(currentFile.workflows);
      this.utils.each((responds || []), res => {
        const { results, status } = res;

        if (status?.toLowerCase() === 'finished') { // status: Finished / InProgress
          const { virus_detection, quarantine } = results;

          if (this.utils.isEmpty(this.virusDetection) && virus_detection && virus_detection.data) {
            this.virusDetection = virus_detection.data;
          }

          if (this.utils.isEmpty(this.quarantine) && quarantine && quarantine.data) {
            this.quarantine = quarantine.data;
          }
        }
      });
    } catch (err) {
      console.error('FILESTACK_WORKFLOW_STATUS::', err);
      throw err;
    }
  }

  private _resetUILogic() {
    this.virusDetection = {};
    this.quarantine = {};
    if (this.videoEle) {
      this.videoEle.nativeElement?.load();
    }
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.file && change.file.currentValue && change.file.currentValue.workflows) {
      this.updateWorkflowStatus(change.file.currentValue);
    }
  }

  async previewFile(file) {
    if (!file.url) {
      return;
    }
    try {
      return await this.filestackService.previewFile(file);
    } catch (err) {
      console.error('FILESTACK_PREVIEW::', err);
      return err;
    }
  }

  actionBtnClick(file: {
    handle: string;
    url: string;
  }, index: number): void {
    if (this.fileType !== 'any') {
      return this.removeUploadedFile(file);
    }

    switch (index) {
      case 0:
        this.utils.downloadFile(file.url);
        return;
      case 1:
        this.previewFile(file);
        return;
      case 2:
        this.removeUploadedFile(file);
        return;
    }
  }

  removeUploadedFile(file?): void {
    return this.removeFile.emit(file);
  }

  get endingActionBtnIcons() {
    let icons = [];
    if (this.fileType === 'any') {
      icons = ['download', 'search']
    };
    if (this.removeFile.observers.length > 0 && !this.disabled) {
      icons.push('trash');
    }
    return icons;
  }

}
