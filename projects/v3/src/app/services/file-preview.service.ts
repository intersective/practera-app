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
  async preview(file: { url?: string; handle?: string; name?: string; size?: number; mimetype?: string; type?: string }): Promise<any> {
    const fileUrl = file.url;

    if (!fileUrl) {
      return this.notificationsService.alert({
        subHeader: $localize`Inaccessible file`,
        message: $localize`The file URL is not available.`,
      });
    }

    const mime = file.mimetype || file.type || '';
    const isOfficeDoc = mime.startsWith('application/vnd.openxmlformats-officedocument.');
    const isImage = mime.startsWith('image/');
    const isPdf = mime === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf');

    // large application file warning using local size info (skip for inline-previewable types)
    if (!isImage && !isPdf && !isOfficeDoc && mime.includes('application/') && file.size) {
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
  async openModal(url: string, file?: { url?: string; name?: string; mimetype?: string; type?: string; size?: number }): Promise<void> {
    const modal = await this.modalController.create({
      component: FilePreviewComponent,
      componentProps: {
        url,
        file: {
          ...(file || {}),
          url: file?.url || url,
          mimetype: file?.mimetype || file?.type,
          type: file?.type || file?.mimetype,
        },
      },
      cssClass: 'file-preview-modal',
    });
    return await modal.present();
  }
}
