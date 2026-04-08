/* eslint-disable no-console */

import { ModalController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { UploadResult, Uppy, UppyFile, UppyOptions } from '@uppy/core';
import Tus from '@uppy/tus';
import { BrowserStorageService } from '../../services/storage.service';
import { Dashboard } from 'uppy';
import { environment } from '../../../environments/environment';
import { FfmpegService, CompressionProgress } from '../../services/ffmpeg.service';
import { Subject } from 'rxjs';

export interface UppyUploaderResponse {
  path: string;
  bucket: string;
  name: string;
  url: string;
  extension: string;
  type: string;
  size: number;
}

export interface UppyFileData {
  source: string;
  id: string;
  name: string;
  extension: string;
  meta: {
    relativePath: string | null;
    name: string;
    type: string;
  };
  type: string;
  data: any;
  progress: {
    uploadStarted: number;
    uploadComplete: boolean;
    percentage: number;
    bytesUploaded: number;
    bytesTotal: number;
  };
  size: number;
  isGhost: boolean;
  isRemote: boolean;
  preview: string;
  tus: {
    uploadUrl: string;
  };

  // custom fields (Tus Server)
  bucket: string;
  path: string;
  url: string;
}

type FileMetadata = { [key: string]: any };
type FileBody = { [key: string]: any };

const UPPY_PROPS = {
  small: true,
  size: 'sm',
  inline: true,
  width: '100%',
  height: '200px',
  showProgressDetails: true,
  singleFileFullScreen: true,
  note: 'Upload files here',
  proudlyDisplayPoweredByUppy: false,
  hideRetryButton: false,
  hidePauseResumeButton: false,
  hideCancelButton: false,
  showRemoveButtonAfterComplete: true,
  hideProgressAfterFinish: false,
  doneButtonHandler: null,
};

export const ALLOWED_FILE_TYPES = [
  'image/*',
  'video/*',
  '.jpeg',
  '.png',
  'application/pdf',
  'text/plain', // .txt
  'text/csv', // .csv
  'application/msword', // .doc
  'application/vnd.ms-excel', // .xls
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];

@Injectable({
  providedIn: 'root'
})
export class UppyUploaderService {
  readonly uppyProps = UPPY_PROPS;
  private patchValue: {
    [key: string]: {
      path: string;
      bucket: string;
    };
  };

  /** emits compression progress for ui consumption */
  readonly compressionProgress$ = new Subject<CompressionProgress | null>();

  /** true while a video is being compressed */
  isCompressing = false;

  constructor(
    private modalController: ModalController,
    private storageService: BrowserStorageService,
    private ffmpegService: FfmpegService,
  ) {
  }

  /**
   * Create an Uppy instance
   * @param source
   * @param uploadUrl
   * @param events
   * @param restrictions
   * @returns Uppy<FileMetadata, FileBody>
   */
  createUppyInstance(source: "chat" | "profile" | "assessment" | "any" | "video" | "document" | "image", uploadUrl: string, events?: {
    onAfterResponse: (req: any, res: any) => void,
    onUploadSuccess: (file: UppyFile<any, any>, response: any) => void
  }, options?: {
    allowedFileTypes: string[];
  }): Uppy<FileMetadata, FileBody> {

    if (!environment.uppyConfig?.restrictions || !environment.stackName) {
      console.error('Uppy configuration is missing or incomplete.');
    }

    const restrictions = { ...environment.uppyConfig.restrictions, ...options };

    const uppyOptions: UppyOptions<FileMetadata, FileBody> = {
      debug: true,
      autoProceed: false,
      restrictions,
    };

    const uppy = new Uppy(uppyOptions)
      .use(Tus, {
      headers: {
        'apikey': this.storageService.getUser().apikey,
        'source': source,
        'stackName': environment.stackName,
      },
      endpoint: uploadUrl,
      retryDelays: [0, 1000, 3000, 5000],
      onError: (error) => {
        console.error("Tus error:", error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, `${percentage}%`);
      },
      onSuccess: (upload) => {
        console.log("Upload complete:", upload);
      },
      onAfterResponse: (req, res) => {
        if (req.getMethod() === 'PATCH') {
          // Handle response data extraction here if needed
          console.log('onAfterResponse::', res.getBody());
          events.onAfterResponse(req, res);
        }
      },
    });

    this.initializeEventHandlers(uppy, events.onUploadSuccess);

    return uppy;
  }

  private initializeEventHandlers(uppy: Uppy<FileMetadata, FileBody>, onUploadSuccess: (file: UppyFile<any, any>, response: any) => void) {
    uppy.on('dashboard:file-edit-start', (file: any) => {
      console.log('file edit start', file);
    }).on('files-added', (files: any) => {
      console.log('files added', files);
      this.compressVideoFiles(uppy, files);
    }).on('file-removed', (file: any) => {
      console.log('file removed', file);
    }).on('restriction-failed', (file: any, error: any) => {
      console.log('restriction failed', file, error);
    }).on('upload-error', (file: any, error: any) => {
      console.log('upload error', file, error);
    }).on('upload-success', (file: any, response: any) => {
      console.log('upload success', file, response);
      console.log('onUploadSuccess', this.patchValue);
      onUploadSuccess(file, response);
    }).on('complete', (result: UploadResult<FileMetadata, FileBody>) => {
      console.log("Uploaded complete:", result);
      if (result?.successful[0]) {
        const fileId = result.successful[0].id;
        const cacheClearResult = this.storageService.clearByName(fileId);
        // eslint-disable-next-line no-console
        console.log('Cache cleared:', cacheClearResult);
      }
    });
  }

  /**
   * compress video files in-place within the uppy instance.
   * replaces original video blob with the compressed version.
   */
  private async compressVideoFiles(uppy: Uppy<FileMetadata, FileBody>, files: UppyFile<any, any>[]): Promise<void> {
    const videoFiles = files.filter(f => f.type?.startsWith('video/'));
    if (videoFiles.length === 0) {
      return;
    }

    for (const uppyFile of videoFiles) {
      const file = new File([uppyFile.data as Blob], uppyFile.name, { type: uppyFile.type });
      const check = this.ffmpegService.shouldCompress(file);

      if (!check.compress) {
        console.log(`skipping compression for ${uppyFile.name}: ${check.reason}`);
        continue;
      }

      try {
        this.isCompressing = true;
        this.compressionProgress$.next({ progress: 0, timeUs: 0 });

        // forward ffmpeg progress to our subject
        const sub = this.ffmpegService.progress$.subscribe(p => {
          this.compressionProgress$.next(p);
        });

        const result = await this.ffmpegService.compressVideo(file);

        sub.unsubscribe();
        this.compressionProgress$.next(null);
        this.isCompressing = false;

        if (!result.skipped) {
          console.log(`compressed ${uppyFile.name}: ${result.originalSize} → ${result.compressedSize} (${result.reductionPercent}% reduction)`);

          // replace the file data in uppy with the compressed version
          uppy.setFileState(uppyFile.id, {
            data: result.file,
            size: result.compressedSize,
            name: result.file.name,
            type: 'video/mp4',
            meta: {
              ...uppyFile.meta,
              name: result.file.name,
              type: 'video/mp4',
            },
          });
        }
      } catch (error) {
        console.error(`compression failed for ${uppyFile.name}, uploading original:`, error);
        this.isCompressing = false;
        this.compressionProgress$.next(null);
      }
    }
  }

  /**
   * this will open up a modal showing the file upload component as the content
   *
   * @link https://intersective.slack.com/archives/C086A45JHSQ/p1736234870910269?thread_ts=1736232498.728959&cid=C086A45JHSQ
   * @param   {string}        source
   * @return  {Promise<HTMLIonModalElement>}
   */
  async open(source: 'chat' | 'user-profile' | 'assessment' | 'media-manager' | 'static' | 'any' | 'image' | 'video' | null): Promise<HTMLIonModalElement> {
    // dynamic import to break circular dependency with UppyUploaderComponent
    const { UppyUploaderComponent } = await import('./uppy-uploader.component');
    const modal = await this.modalController.create({
      component: UppyUploaderComponent,
      componentProps: {
        source
      },
      cssClass: 'uppy-uploader-modal',
    });
    await modal.present();

    return modal;
  }

  getPatchValue(id) {
    return this.patchValue[id];
  }
}
