import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PreviewComponent } from './preview/preview.component';

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
  
  constructor(
    private modalController: ModalController,
  ) {}

  //get filestack config
  getFilestackConfig() {
    return this.filestackConfig;
  }

  // get file types
  getFileTypes(type = 'any') {
    return this.fileTypes[type];
  }

  //get s3 config
  getS3Config() {
    return this.s3Config;
  }

  previewFile(file) {
    let fileUrl = file.url;
    if (fileUrl && fileUrl.indexOf('api/file') !== -1) {
      fileUrl = fileUrl.replace('api/file', 'api/preview');
    } else if (file.handle) {
      fileUrl = 'https://www.filepicker.io/api/preview/' + file.handle;
    }
    this.previewModal(fileUrl);
  }

  async previewModal(url) {
    const modal = await this.modalController.create({
      component: PreviewComponent,
      componentProps: { 
        url: url
      }
    });
    return await modal.present();
  }
}