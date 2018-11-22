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
    any: '.jpg,.jpeg,.png,.JPG,.JPEG,.pdf,.PDF,.PNG,.BAT,.bat,.BMP,.bmp,.CSV,.csv,.CVS,.cvs,.d  oc,.docx,.DOC,.DOCX,.MAC,.mac,.MAP,.map,.PPT,.ppt,.PPTX,.pptx,.PSD,.psd,.PSP,.psp,.QXD,.qxd,.txt,.TXT,.RTF,.rtf,.TAR,.tar,.TIF,.tif,.XLS,.xls,.XLSX,.xlsx,.zip,.ZIP,.rar,.RAR,image/*'
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