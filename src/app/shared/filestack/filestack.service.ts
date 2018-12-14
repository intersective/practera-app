import { Injectable } from '@angular/core';

@Injectable()

export class FilestackService {
  public filestackConfig : any = {
    key: 'AO6F4C72uTPGRywaEijdLz'
  };
  public s3Config : any = {
    location: 's3',
    container: 'practera-aus',
    region: 'ap-southeast-2',
    path: '/case/uploads/public/'
  };
  // file types that allowed to upload
  public fileTypes = {
    any: '',
    image: 'image/*',
    video: 'video/*'
  };
  
  constructor() {}

  //get filestack config
  getFilestackConfig() {
    return this.filestackConfig;
  }

  // get file types
  getFileTypes(type = 'any') {
    return this.fileTypes[type];
  }

  //get s3 config
  getS3Config () {
    return this.s3Config;
  }
}