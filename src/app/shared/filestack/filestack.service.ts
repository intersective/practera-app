import * as filestack from 'filestack-js';
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PreviewComponent } from './preview/preview.component';
import { environment } from '@environments/environment';
import { BrowserStorageService } from '@services/storage.service';

@Injectable()

export class FilestackService {
  private filestack: any;

  // file types that allowed to upload
  public fileTypes = {
    any: '',
    image: 'image/*',
    video: 'video/*'
  };

  constructor(
    private modalController: ModalController,
    private storage: BrowserStorageService
  ) {
    this.filestack = filestack.init(this.getFilestackConfig());

    if (!this.filestack) {
      throw "Filestack module not found.";
    }
  }

  get client() {
    if (!this.filestack) {
      throw "Filestack module not found.";
    }

    return this.filestack;
  }

  //get filestack config
  getFilestackConfig() {
    return environment.filestack.key;
  }

  // get file types
  getFileTypes(type = 'any') {
    return this.fileTypes[type];
  }

  //get s3 config
  getS3Config(fileType) {
    let path = environment.filestack.s3Config.paths.any;
    // get s3 path based on file type
    if (environment.filestack.s3Config.paths[fileType]) {
      path = environment.filestack.s3Config.paths[fileType];
    }
    // add user hash to the path
    path = path + this.storage.getUser().userHash + '/';
    return {
      location: environment.filestack.s3Config.location,
      container: environment.filestack.s3Config.container,
      region: environment.filestack.s3Config.region,
      path: path
    };
  }

  previewFile(file) {
    let fileUrl = file.url;
    if (fileUrl) {
      if (fileUrl.indexOf('www.filepicker.io/api/file') !== -1) {
        // old format
        fileUrl = fileUrl.replace('www.filepicker.io/api/file', 'cdn.filestackcontent.com/preview');
      } else if (fileUrl.indexOf('filestackcontent.com') !== -1) {
        // new format
        fileUrl = fileUrl.replace('filestackcontent.com', 'filestackcontent.com/preview');
      }
    } else if (file.handle) {
      fileUrl = 'https://cdn.filestackcontent.com/preview/' + file.handle;
    }
    this.previewModal(fileUrl, file);
  }

  async open(options = {}, onSuccess = res => res, onError = err => err) {
    let pickerOptions:any = {
      dropPane: {},
      fromSources: [
        'local_file_system',
        'googledrive',
        'dropbox',
        'gmail',
        'video'
      ],
      storeTo: this.getS3Config(this.getFileTypes()),
      onFileUploadFailed: onError,
      onFileUploadFinished: onSuccess,
    };

    return await this.filestack.picker(Object.assign(pickerOptions, options)).open();
  }

  async previewModal(url, filestackUploadedResponse?) {
    const modal = await this.modalController.create({
      component: PreviewComponent,
      componentProps: {
        url: url,
        file: filestackUploadedResponse, // for whole object reference
      }
    });
    return await modal.present();
  }
}
