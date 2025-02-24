/* eslint-disable no-console */

import { ModalController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { UploadResult, Uppy, UppyFile, UppyOptions } from '@uppy/core';
import Tus from '@uppy/tus';
import { environment } from '../../../environments/environment';
import { UppyUploaderComponent } from './uppy-uploader.component';
import { BrowserStorageService } from '../../services/storage.service';

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
  bucket: string;
  path: string;
}

type FileMetadata = { [key: string]: any };
type FileBody = { [key: string]: any };

const UPPY_PROPS = {
  small: true,
  inline: true,
  width: '100%',
  height: 200,
  showProgressDetails: true,
  note: 'Upload files here',
  proudlyDisplayPoweredByUppy: false,
  hideRetryButton: false,
  hidePauseResumeButton: false,
  hideCancelButton: false,
  showRemoveButtonAfterComplete: true,
  hideProgressAfterFinish: false,
  doneButtonHandler: null,
};

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

  constructor(
    private modalController: ModalController,
    private storageService: BrowserStorageService,
  ) {
  }

  createUppyInstance(source: string, uploadUrl: string, events?: {
    onAfterResponse: (req: any, res: any) => void,
    onUploadSuccess: (file: UppyFile<any, any>, response: any) => void
  }): Uppy<FileMetadata, FileBody> {
    const uppyOptions: UppyOptions<FileMetadata, FileBody> = {
      debug: true,
      autoProceed: false,
      restrictions: {
        ...environment.uppyConfig.restrictions,
        allowedFileTypes: ['image/*', 'video/*', '.jpeg', '.png', 'application/pdf'],
      },
    };

    const uppy = new Uppy(uppyOptions);

    uppy.use(Tus, {
      headers: {
        'apikey': this.storageService.getUser().apikey,
        'source': source,
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
   * this will open up a modal showing the file upload component as the content
   *
   * @link https://intersective.slack.com/archives/C086A45JHSQ/p1736234870910269?thread_ts=1736232498.728959&cid=C086A45JHSQ
   * @param   {string}        source
   * @return  {Promise<HTMLIonModalElement>}
   */
  async open(source: 'chat' | 'user-profile' | 'assessment' | 'media-manager' | 'static' | null): Promise<HTMLIonModalElement> {
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
