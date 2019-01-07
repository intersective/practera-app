import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BrowserStorageService } from '@services/storage.service';

@Injectable()

export class FilestackService {
  // file types that allowed to upload
  public fileTypes = {
    any: '',
    image: 'image/*',
    video: 'video/*'
  };
  
  constructor(
    private storage: BrowserStorageService
  ) {}

  //get filestack config
  getFilestackConfig() {
    return environment.filestack.key;
  }

  // get file types
  getFileTypes(type = 'any') {
    return this.fileTypes[type];
  }

  //get s3 config
  getS3Config (fileType) {
    let s3Config = environment.filestack.s3Config;
    if (s3Config.paths[fileType]) {
      s3Config.path = s3Config.paths[fileType];
    }
    s3Config.path = s3Config.path + this.storage.getUser().userHash + '/';
    return s3Config;
  }
}