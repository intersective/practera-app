import {
  UppyFileData,
  UppyUploaderService,
  ALLOWED_FILE_TYPES,
  TusUploadResponse,
  UppyUploadSource,
} from './uppy-uploader.service';
import { environment } from '@v3/environments/environment';
import { NotificationsService } from './../../services/notifications.service';
import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Uppy, UppyFile } from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import { ModalController } from '@ionic/angular';
import { BrowserStorageService } from '../../services/storage.service';

type FileMetadata = { [key: string]: any };
type FileBody = { [key: string]: any };

@Component({
  standalone: false,
  selector: "app-uppy-uploader",
  templateUrl: "./uppy-uploader.component.html",
  styleUrls: ["./uppy-uploader.component.scss"],
})
export class UppyUploaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dashboard', { static: true }) private dashboard: ElementRef<HTMLDivElement>;
  @Input() source!: UppyUploadSource;
  @Input() tusEndpoint?: string = environment.uppyConfig.tusUrl; // tusUrl
  @Output() uploadComplete = new EventEmitter<any>();

  uploadedFile: UppyFile<any, any> | null = null;

  uppy: Uppy<FileMetadata, FileBody>;
  // Uppy UI
  uppyProps: any;

  s3Info: TusUploadResponse;

  constructor(
    private notificationsService: NotificationsService,
    private modalController: ModalController,
    private storageService: BrowserStorageService,
    private uppyUploaderService: UppyUploaderService,
  ) {
    this.uppyProps = {
      ...this.uppyUploaderService.uppyProps,
      height: '500px',
      note: "Upload a file here",
    };
  }

  ngOnInit() {
    if (!this.tusEndpoint) {
      throw new Error("tusEndpoint is required.");
    }

    if (!this.source) {
      throw new Error("source is required.");
    }

    this.uppy = this.uppyUploaderService.createUppyInstance(this.source, this.tusEndpoint, {
      onAfterResponse: this.onAfterResponse.bind(this),
      onUploadSuccess: this.onUploadSuccess.bind(this),
    }, {
      allowedFileTypes: this.loadAllowedFileTypes(),
    });
  }

  ngAfterViewInit() {
    this.uppy.use(Dashboard, {
      ...this.uppyProps,
      inline: true,
      target: this.dashboard.nativeElement,
    });
  }

  reset() {
    this.uppy.resetProgress();
  }

  loadAllowedFileTypes() {
    switch(this.source) {
      case "profile":
      case "user-profile":
      case "image":
        return ["image/*"];

      case "video":
        return ["video/*"];

      case "chat":
      case "any":
      default:
        return ALLOWED_FILE_TYPES;
    }
  }

  clearUploadedCache(name: string) {
    return this.storageService.clearByName(name);
  }

  sanitizeName(name: string) {
    return name.replace(/[^a-zA-Z0-9]/g, '/');
  }

  onAfterResponse(req, res) {
    try {
      // eslint-disable-next-line no-console
      console.log("Uploaded files:", req, res);
      this.s3Info = this.uppyUploaderService.parseTusUploadResponse(res.getBody());
    } catch(error) {
      this.notificationsService.alert({
        header: "Upload Failed",
        message: error.message,
      });
      throw error;
    }
  }

  ngOnDestroy() {
    this.uppy?.destroy();
  }

  closeModal(file) {
    if (!this.s3Info) {
      throw new Error('Upload server response is missing required file metadata.');
    }

    const data: UppyFileData = {
      ...file,
      ...{
        bucket: this.s3Info.bucket,
        path: this.s3Info.path,
        url: this.s3Info.cdnUrl,
        cdnUrl: this.s3Info.cdnUrl,
        directUrl: this.s3Info.directUrl,
      }
    };
    this.modalController.dismiss(data);
  }

  onUploadSuccess(file: UppyFile<any, any>, response: any) {
    if (response && response.status === 200) {
      this.uploadedFile = file;
      this.closeModal(file);
      this.uploadComplete.emit(response.body);
    } else {
      console.warn("Upload failed:", response);
    }
  }
}
