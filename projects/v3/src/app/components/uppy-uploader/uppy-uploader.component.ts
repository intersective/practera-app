import { UppyFileData, UppyUploaderService, ALLOWED_FILE_TYPES } from './uppy-uploader.service';
import { environment } from '@v3/environments/environment';
import { NotificationsService } from './../../services/notifications.service';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Uppy, UppyFile, UppyOptions, } from '@uppy/core';
import { ModalController } from '@ionic/angular';
import { BrowserStorageService } from '../../services/storage.service';
import Dashboard from '@uppy/dashboard';

type FileMetadata = { [key: string]: any };
type FileBody = { [key: string]: any };

@Component({
  standalone: false,
  selector: "app-uppy-uploader",
  templateUrl: "./uppy-uploader.component.html",
  styleUrls: ["./uppy-uploader.component.scss"],
})
export class UppyUploaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() source!: "chat" | "profile" | "assessment" | "any" | "video" | "document" | "image";
  @Input() tusEndpoint?: string = environment.uppyConfig.tusUrl;
  @Output() uploadComplete = new EventEmitter<any>();

  @ViewChild('uppyContainer', { static: false }) uppyContainerRef!: ElementRef<HTMLDivElement>;

  uploadedFile: UppyFile<any, any> | null = null;
  uppy: Uppy<FileMetadata, FileBody>;

  s3Info: {
    path: string;
    bucket: string;
    url: string;
  };

  constructor(
    private notificationsService: NotificationsService,
    private modalController: ModalController,
    private storageService: BrowserStorageService,
    private uppyUploaderService: UppyUploaderService,
  ) {}

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
    if (this.uppy && this.uppyContainerRef?.nativeElement) {
      this.uppy.use(Dashboard, {
        inline: true,
        target: this.uppyContainerRef.nativeElement,
        width: '100%',
        height: '100%',
        hideProgressDetails: false,
        proudlyDisplayPoweredByUppy: false,
        note: 'Upload a file here',
        hideRetryButton: false,
        hidePauseResumeButton: false,
        hideCancelButton: false,
        showRemoveButtonAfterComplete: true,
      });
    }
  }

  loadAllowedFileTypes() {
    switch (this.source) {
      case "profile":
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

  onAfterResponse(req: any, res: any) {
    try {
      this.s3Info = JSON.parse(res.getBody());
    } catch (error) {
      this.notificationsService.alert({
        header: "Upload Failed",
        message: "No response from server",
      });
    }
  }

  ngOnDestroy() {
    if (this.uppy) {
      this.uppy.off("upload-success", (res: any) => {});
      this.uppy.off("complete", (res: any) => {});
      this.uppy.resetProgress();
    }
  }

  closeModal(file: any) {
    const data: UppyFileData = {
      ...file,
      ...{
        bucket: this.s3Info?.bucket,
        path: this.s3Info?.path,
        url: this.s3Info?.url,
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
