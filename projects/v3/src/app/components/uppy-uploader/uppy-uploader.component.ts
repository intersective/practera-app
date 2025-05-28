import { UppyFileData, UppyUploaderService } from './uppy-uploader.service';
import { environment } from '@v3/environments/environment';
import { NotificationsService } from './../../services/notifications.service';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Uppy, UppyFile, UppyOptions, } from '@uppy/core';
import { ModalController } from '@ionic/angular';
import { BrowserStorageService } from '../../services/storage.service';
import { UtilsService } from '../../services/utils.service';

type FileMetadata = { [key: string]: any };
type FileBody = { [key: string]: any };

@Component({
  selector: "app-uppy-uploader",
  templateUrl: "./uppy-uploader.component.html",
  styleUrls: ["./uppy-uploader.component.scss"],
})
export class UppyUploaderComponent implements OnInit, OnDestroy {
  @Input() source!: "chat" | "profile" | "assessment" | "any" | "video" | "document" | "image";
  @Input() tusEndpoint?: string = environment.uppyConfig.tusUrl; // tusUrl
  @Input() allowedFileTypes: string[] = [
    "image/*",
    "video/*",
    ".jpeg",
    ".png",
    "application/pdf",
  ];
  @Output() uploadComplete = new EventEmitter<any>();

  uploadedFile: UppyFile<any, any> | null = null;

  uppy: Uppy<FileMetadata, FileBody>;
  // Uppy UI
  uppyProps = this.uppyUploaderService.uppyProps;

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
    private utils: UtilsService,
  ) {
    this.uppyProps.height = '500px';
    this.uppyProps.note = "Upload a file here";
  }

  ngOnInit() {
    if (!this.tusEndpoint) {
      throw new Error("tusEndpoint is required.");
    }

    if (!this.source) {
      throw new Error("source is required.");
    }

    this.allowedFileTypes = this.loadAllowedFileTypes();

    this.uppy = this.uppyUploaderService.createUppyInstance(this.source, this.tusEndpoint, {
      onAfterResponse: this.onAfterResponse.bind(this),
      onUploadSuccess: this.onUploadSuccess.bind(this),
    }, {
      allowedFileTypes: this.allowedFileTypes,
    });
  }

  reset() {
    this.uppy.resetProgress();
  }

  loadAllowedFileTypes() {
    switch(this.source) {
      case "profile":
      case "image":
        return ["image/*"];

      case "video":
        return ["video/*"];

      case "chat":
      case "any":
      default:
        return [
          "image/*",
          "video/*",
          "application/*"
        ];
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
      this.s3Info = JSON.parse(res.getBody());
    } catch(error) {
      this.notificationsService.alert({
        header: "Upload Failed",
        message: "No response from server",
      });
    }
  }

  ngOnDestroy() {
    if (this.uppy) {
      // eslint-disable-next-line no-console
      this.uppy.off("upload-success", (res) => console.info(res));

      // eslint-disable-next-line no-console
      this.uppy.off("complete", (res) => console.info(res));
      this.uppy.resetProgress();
    }
  }

  closeModal(file) {
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
