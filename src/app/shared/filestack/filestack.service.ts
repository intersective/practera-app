import { Injectable } from '@angular/core';

@Injectable()

export class FilestackService {
  public filestackConfig : any = {
    key: 'AO6F4C72uTPGRywaEijdLz'
  };
  public s3Config : any = {
    location: 's3',
    container: 'practera-aus',
    region: 'ap-southest-2',
    path: '/case/uploads/public/',
    access: 'public'
  };
  
  constructor() {}

  //get filestack config
  getFilestackConfig() {
    return this.filestackConfig;
  }
  //get s3 config
  getS3Config () {
    return this.s3Config;
  }
}