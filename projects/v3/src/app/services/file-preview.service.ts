import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationsService } from '@v3/services/notifications.service';
import { UtilsService } from '@v3/services/utils.service';
import { FilePreviewComponent } from '../components/file-preview/file-preview.component';

@Injectable({
  providedIn: 'root'
})
export class FilePreviewService {

  constructor(
    private modalController: ModalController,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
  ) {}

  // open a file preview modal for given file object
  async preview(file: { url?: string; handle?: string; name?: string; size?: number; mimetype?: string }): Promise<any> {
    let fileUrl = file.url;
    if (fileUrl) {
      if (fileUrl.indexOf('www.filepicker.io/api/file') !== -1) {
        fileUrl = fileUrl.replace('www.filepicker.io/api/file', 'cdn.filestackcontent.com/preview');
      } else if (fileUrl.indexOf('filestackcontent.com') !== -1) {
        fileUrl = fileUrl.replace('filestackcontent.com', 'filestackcontent.com/preview');
      }
    } else if (file.handle) {
      fileUrl = 'https://cdn.filestackcontent.com/preview/' + file.handle;
    }

    if (!fileUrl) {
      return this.notificationsService.alert({
        subHeader: $localize`Inaccessible file`,
        message: $localize`The file URL is not available.`,
      });
    }

    // large application file warning using local size info
    if (file.mimetype?.includes('application/') && file.size) {
      const megabyte = file.size / 1000 / 1000;
      if (megabyte > 10) {
        return this.notificationsService.alert({
          subHeader: $localize`File size too large`,
          message: $localize`Attachment size has exceeded the size of ${Math.floor(megabyte)}mb please consider downloading the file for better reading experience.`,
          buttons: [
            {
              text: $localize`Download`,
              handler: () => {
                return this.utils.openUrl(file.url, { target: '_blank' });
              }
            },
            {
              text: $localize`Cancel`,
              role: 'cancel',
              handler: () => { return; }
            },
          ]
        });
      }
    }

    return this.openModal(fileUrl, file);
  }

  // open preview modal with given url and optional file reference
  async openModal(url: string, file?: any): Promise<void> {
    const modal = await this.modalController.create({
      component: FilePreviewComponent,
      componentProps: {
        url,
        file: file || {},
      },
      cssClass: 'filestack-preview-modal',
    });
    return await modal.present();
  }
}
