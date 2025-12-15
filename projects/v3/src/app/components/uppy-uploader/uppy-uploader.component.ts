import { AlertController, ModalController } from '@ionic/angular';
import { UppyFileData, UppyUploaderService, ALLOWED_FILE_TYPES } from './uppy-uploader.service';
import { environment } from '@v3/environments/environment';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Uppy, UppyFile } from '@uppy/core';
import { BrowserStorageService } from '../../services/storage.service';

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
  @Output() uploadComplete = new EventEmitter<any>();

  uploadedFile: UppyFile<any, any> | null = null;

  uppy: Uppy<FileMetadata, FileBody>;
  // Uppy UI
  uppyProps: any; // Changed to any to resolve immediate type issue

  s3Info: {
    path: string;
    bucket: string;
    url: string;
  };

  constructor(
    private storageService: BrowserStorageService,
    private uppyUploaderService: UppyUploaderService,
    private alertController: AlertController,
    private modalController: ModalController,
  ) {
    this.uppyProps = { ...this.uppyUploaderService.uppyProps };
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

    this.uppy = this.uppyUploaderService.createUppyInstance(this.source, this.tusEndpoint, {
      onAfterResponse: this.onAfterResponse.bind(this),
      onUploadSuccess: this.onUploadSuccess.bind(this),
    }, {
      allowedFileTypes: this.loadAllowedFileTypes(),
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
        return ALLOWED_FILE_TYPES;
    }
  }

  clearUploadedCache(name: string) {
    return this.storageService.clearByName(name);
  }

  sanitizeName(name: string) {
    return name.replace(/[^a-zA-Z0-9]/g, '/');
  }

  async onAfterResponse(req, res) {
    try {
      // eslint-disable-next-line no-console
      console.log("Uploaded files:", req, res);
      this.s3Info = JSON.parse(res.getBody());
    } catch(error) {
      const popup = await this.alertController.create({
        header: "Upload Failed",
        message: "No response from server",
      });
      await popup.present();
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
