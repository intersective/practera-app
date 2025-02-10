import { UppyUploaderService } from './uppy-uploader.service';
import { environment } from '@v3/environments/environment';
import { NotificationsService } from './../../services/notifications.service';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Uppy, UppyFile, UppyOptions } from '@uppy/core';
import RemoteSources from '@uppy/remote-sources';
import Tus from '@uppy/tus';
import { ModalController } from '@ionic/angular';
import { BrowserStorageService } from '../../services/storage.service';

type FileMetadata = { [key: string]: any };
type FileBody = { [key: string]: any };

@Component({
  selector: "app-uppy-uploader",
  templateUrl: "./uppy-uploader.component.html",
  styleUrls: ["./uppy-uploader.component.scss"],
})
export class UppyUploaderComponent implements OnInit, OnDestroy {
  @Input() source!: string;
  @Input() tusEndpoint?: string = environment.uppyConfig.tusUrl; // tusUrl
  @Input() allowedFileTypes: string[] = [
    "image/*",
    "video/*",
    ".jpeg",
    ".png",
    "application/pdf",
  ];
  @Output() uploadComplete = new EventEmitter<any>();

  uppy: Uppy<FileMetadata, FileBody>;
  // Uppy UI
  uppyProps = {
    inline: true,
    width: '100%',
    height: '70vh',
    showProgressDetails: true,
    note: 'Images only, up to 10 MB',
    proudlyDisplayPoweredByUppy: false,
    hideRetryButton: false,
    hidePauseResumeButton: false,
    hideCancelButton: false,
    hideProgressAfterFinish: false,
    doneButtonHandler: null,
  };

  s3Info: string; /* {
    path: string;
    bucket: string;
  } */;

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

    this.allowedFileTypes = this.loadAllowedFileTypes();

    const uppyOptions: UppyOptions<FileMetadata, FileBody> = {
      debug: true,
      autoProceed: false,
      restrictions: {
        ...environment.uppyConfig.restrictions,
        allowedFileTypes: this.allowedFileTypes,
      },
    };

    this.uppy = new Uppy(uppyOptions);
    this.uppy.use(Tus, {
      headers: {
        'source': this.source,
        'apikey': this.storageService.getUser().apikey,
      },
      endpoint: this.tusEndpoint,
      retryDelays: [0, 1000, 3000, 5000],
      // withCredentials: true,
      onBeforeRequest: (req) => {
        this.reset();
        // eslint-disable-next-line no-console
        console.log('onBeforeRequest', req);
      },
      onError: (error) => {
        this.notificationsService.alert({
          header: "Upload Failed",
          message: error?.message,
        });
        console.error("Upload error:", error);
        return;
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        // eslint-disable-next-line no-console
        console.log(bytesUploaded, bytesTotal, `${percentage}%`);
      },
      onSuccess: (upload) => {
        // eslint-disable-next-line no-console
        console.log("Upload complete:", upload);
      },
      onAfterResponse: async (req, res) => {
        try {
          // eslint-disable-next-line no-console
          console.log('onAfterResponse', req, res);
          const body = res.getBody();
          // eslint-disable-next-line no-console
          console.log('onAfterResponse::res.getBody()', body);

          this.s3Info = body;
          // eslint-disable-next-line no-console
          console.log('onAfterResponse::this.s3Info', this.s3Info);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('onAfterResponse::error', error);
          this.notificationsService.alert({
            header: "Upload Failed",
            message: error.message,
          });
        }
      },
    }).on("upload", (data) => {
      // eslint-disable-next-line no-console
      console.log("Upload started:", data);
    })
    .on("upload-error", (file, error) => {
      console.warn("Upload error:", error);
    })
    .on("file-added", (file) => {
      // eslint-disable-next-line no-console
      console.log("File added:", file);
    })
    .on("upload-success", (file, response) => {
      if (response && response.status === 200) {
        this.uploadComplete.emit(response.body);
      } else {
        console.warn("Upload failed:", response);
      }
    })
    .on("restriction-failed", (file, error) => {
      console.warn("Restriction failed:", error);
      this.notificationsService.alert({
        header: "Upload Failed",
        message: error.message,
      });
    })
    .on("error", (error) => {
      console.error("Error:", error);
    })
    .on("complete", this.onComplete.bind(this));
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
          "application/pdf"
        ];
    }
  }

  onComplete(result) {
    // eslint-disable-next-line no-console
    console.log("Uploaded files:", result);

    if (this.s3Info) {
      this.closeModal(result);
    } else {
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

  closeModal(result) {
    const s3Info = JSON.parse(this.s3Info);
    const data = {
      ...result,
      ...{
        bucket: s3Info?.bucket,
        path: s3Info?.path,
      }
    };
    this.modalController.dismiss(data);
  }
}
