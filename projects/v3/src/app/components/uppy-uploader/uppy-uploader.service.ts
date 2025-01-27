import { ModalController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Uppy } from '@uppy/core';
import { UppyUploaderComponent } from './uppy-uploader.component';
import Tus from '@uppy/tus';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UppyUploaderService {
  private uppy: Uppy;

  constructor(
    private modalController: ModalController,
  ) {
    this.uppy = new Uppy()
      .use(Tus, {
        endpoint: environment.uppyConfig.tusUrl,
      });

    this.uppy.on('complete', (result) => {
      // eslint-disable-next-line no-console
      console.log('Upload complete! We’ve uploaded these files:', result.successful);
    });
  }

  addFile(file: File) {
    this.uppy.addFile({
      name: file.name,
      type: file.type,
      data: file
    });
  }

  upload() {
    this.uppy.upload();
  }

  /**
   * this will open up a modal showing the uppy uploader component as the content
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
      }
    });
    await modal.present();

    return modal;
  }

  // extract response from tus upload XHR state
  extractResponseData(response: {
    _xhr: {
      response: string;
    };
  }): {
    path: string;
    bucket: string;
  } {
    const res = response?._xhr?.response;
    const data = JSON.parse(res);

    // eslint-disable-next-line no-console
    console.log('uppy-xhr', data);

    return data;
  }
}
