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
}