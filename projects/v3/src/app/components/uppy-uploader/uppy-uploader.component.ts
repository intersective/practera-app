import { environment } from '@v3/environments/environment';
import { NotificationsService } from './../../services/notifications.service';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Uppy, UppyFile, UppyOptions } from '@uppy/core';
import RemoteSources from '@uppy/remote-sources';
import Tus from '@uppy/tus';

type FileMetadata = { [key: string]: any };
type FileBody = { [key: string]: any };

@Component({
  selector: "app-uppy-uploader",
  templateUrl: "./uppy-uploader.component.html",
  styleUrls: ["./uppy-uploader.component.scss"],
})
export class UppyUploaderComponent implements OnInit, OnDestroy {
  @Input() uploadUrl?: string = environment.uppyConfig.tusUrl; // tusUrl
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
    height: 300,
    showProgressDetails: true,
    note: 'Images only, up to 10 MB',
    proudlyDisplayPoweredByUppy: false,
    hideRetryButton: false,
    hidePauseResumeButton: false,
    hideCancelButton: false,
    hideProgressAfterFinish: false,
    doneButtonHandler: null,
  };

  constructor(
    private notificationsService: NotificationsService,
  ) {}

  ngOnInit() {
    if (!this.uploadUrl) {
      throw new Error("uploadUrl is required.");
    }

    const uppyOptions: UppyOptions<FileMetadata, FileBody> = {
      debug: true,
      autoProceed: false,
      restrictions: {
        ...environment.uppyConfig.restrictions,
        allowedFileTypes: this.allowedFileTypes,
      },
    };

    this.uppy = new Uppy(uppyOptions);
    this.uppy.use(RemoteSources, {
      companionUrl: this.uploadUrl,
    }).use(Tus, {
      endpoint: this.uploadUrl || environment.uppyConfig.tusUrl,
      retryDelays: [0, 1000, 3000, 5000],
      // withCredentials: true,
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log("Tus error:", error);
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
    });

    this.uppy
      .on("upload", (data) => {
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
      .on("complete", this.onComplete);
  }


  onComplete(result) {
    const successfulFiles: UppyFile<FileMetadata, FileBody>[] =
      result.successful;

    // eslint-disable-next-line no-console
    console.log("Uploaded files:", successfulFiles);
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
}
