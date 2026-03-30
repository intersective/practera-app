import { UppyUploaderService } from './../../../components/uppy-uploader/uppy-uploader.service';
import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { NotificationsService } from '../../../services/notifications.service';

@Component({
  standalone: false,
  selector: 'app-attachment-popover',
  templateUrl: './attachment-popover.component.html',
  styleUrls: ['./attachment-popover.component.scss'],
})
export class AttachmentPopoverComponent{

  constructor(
    private popoverController: PopoverController,
    private uppyUploaderService: UppyUploaderService,
    private notificationsService: NotificationsService,
  ) { }

  /**
   * This will cloase the group chat popup
   */
    close(selectedFile: {
      url: string;
      filename: string;
      mimetype: string;
      size: number;
      path: string;
      bucket: string;
    } = null) {
      this.popoverController.dismiss({
        selectedFile
      });
    }

    async openAttachPopup(selectedType) {
      try {
        const modal = await this.uppyUploaderService.open(selectedType);
        modal.onDidDismiss().then(async (res) => {
          if (res.data) {
            this.close(res.data);
          }
        });
      }
      catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        this.notificationsService.alert({
          header: 'Upload Failed',
          message: error.message,
        });
      }
    }

}
