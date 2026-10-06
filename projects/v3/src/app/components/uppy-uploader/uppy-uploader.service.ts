/* eslint-disable no-console */

import { ModalController } from '@ionic/angular/lazy';
import { Injectable } from '@angular/core';
import { UploadResult, Uppy, UppyFile, UppyOptions } from '@uppy/core';
import Tus from '@uppy/tus';
import { environment } from '../../../environments/environment';
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

const UPLOAD_SOURCES = ['chat', 'user-profile', 'assessment', 'media-manager', 'static', 'project-hub'] as const;
export type UppyUploadSource = typeof UPLOAD_SOURCES[number];
export type UppyUploadFileType = 'any' | 'image' | 'video';

export interface TusUploadResponse {
  path: string;
  bucket: string;
  cdnUrl: string;
  directUrl: string;
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
  cdnUrl: string;
  directUrl: string;
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

  constructor(
    private modalController: ModalController,
    private storageService: BrowserStorageService,
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
  createUppyInstance(source: UppyUploadSource, uploadUrl: string, events?: {
    onAfterResponse: (req: any, res: any) => void,
    onUploadSuccess: (file: UppyFile<any, any>, response: any) => void
  }, options?: {
    allowedFileTypes: string[];
  }): Uppy<FileMetadata, FileBody> {

    if (!environment.uppyConfig?.restrictions || !environment.stackName) {
      console.error('Uppy configuration is missing or incomplete.');
    }

    if (!UPLOAD_SOURCES.includes(source)) {
      throw new Error('Unsupported upload source.');
    }

    const restrictions = { ...environment.uppyConfig.restrictions, ...options };
    const requestFiles = new WeakMap<object, UppyFile<FileMetadata, FileBody>>();

    const uppyOptions: UppyOptions<FileMetadata, FileBody> = {
      debug: false,
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
      onBeforeRequest: (req, file) => {
        requestFiles.set(req, file);
      },
      onAfterResponse: (req, res) => {
        // Let tus-js-client handle HTTP errors; error bodies are not upload metadata.
        if (res.getStatus() < 200 || res.getStatus() >= 300) {
          return;
        }

        const method = req.getMethod();
        if (method === 'HEAD') {
          const offset = res.getHeader('Upload-Offset');
          const length = res.getHeader('Upload-Length');
          if (offset !== null && length !== null && /^\d+$/.test(offset) && /^\d+$/.test(length) && Number(offset) === Number(length)) {
            const result = res.getHeader('Upload-Result');
            events?.onAfterResponse(req, {
              getBody: () => result || '',
            });
          }
          return;
        }

        if (method === 'POST' || method === 'PATCH') {
          const file = requestFiles.get(req);
          const offset = res.getHeader('Upload-Offset');
          const completed = (method === 'POST' && file?.size === 0) ||
            offset !== null && Number(offset) === file?.size;
          if (completed) {
            events?.onAfterResponse(req, res);
          }
        }
      },
    });

    this.initializeEventHandlers(uppy, events?.onUploadSuccess);

    return uppy;
  }

  parseTusUploadResponse(body: string): TusUploadResponse {
    if (!body?.trim()) {
      throw new Error('Upload server returned an empty response.');
    }

    let response: Partial<TusUploadResponse>;
    try {
      response = JSON.parse(body);
    } catch {
      throw new Error('Upload server returned an invalid response.');
    }

    if (!response.bucket || !response.path || !response.cdnUrl || !response.directUrl) {
      throw new Error('Upload server response is missing required file metadata.');
    }

    return response as TusUploadResponse;
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
      onUploadSuccess?.(file, response);
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
  async open(source: UppyUploadSource, allowedFileTypes?: string[]): Promise<HTMLIonModalElement> {
    // dynamic import to break circular dependency with UppyUploaderComponent
    const { UppyUploaderComponent } = await import('./uppy-uploader.component');
    const modal = await this.modalController.create({
      component: UppyUploaderComponent,
      componentProps: {
        source,
        allowedFileTypes,
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
