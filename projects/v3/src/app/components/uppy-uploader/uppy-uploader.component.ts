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

  s3Info: {
    path: string;
    bucket: string;
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
        // eslint-disable-next-line no-console
        console.log('onAfterResponse', req, res);
        // eslint-disable-next-line no-console
        console.log('onAfterResponse::res.getBody()', res.getBody());

        // eslint-disable-next-line no-console
        req.getMethod() === 'POST' && console.log('onAfterResponse::res.getBody()', res.getBody());

        /* if (req.getMethod() === 'POST') {
          const data = JSON.parse(res?._xhr?.response);

          // eslint-disable-next-line no-console
          console.log('uppy-xhr', data);

          this.s3Info = data;
        } */
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

    this.closeModal(result);
  }

  ngOnDestroy() {
    if (this.uppy) {
      // eslint-disable-next-line no-console
      this.uppy.off("upload-success", (res) => console.info(res));

      // eslint-disable-next-line no-console
      this.uppy.off("complete", (res) => console.info(res));
      // this.uppy.close();
    }
  }

  closeModal(result) {
    const data = {
      ...result,
      ...{
        bucket: this.s3Info?.bucket,
        path: this.s3Info?.path,
      }
    };
    this.modalController.dismiss(data);
  }
}
