import { UppyUploaderService } from './../../../components/uppy-uploader/uppy-uploader.service';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { FilestackService } from '@v3/services/filestack.service';
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
    private filestackService: FilestackService,
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
        if (selectedType === 'uppy') {
          const modal = await this.uppyUploaderService.open('chat');
          modal.onDidDismiss().then(async (res) => {
            if (res.data) {
              const success = res.data.successful.length > 0 ? res.data.successful[0] : {};
              this.close(success);
            }
          });
          return;
        }

        const options: any = {};
        if (this.filestackService.getFileTypes(selectedType)) {
          options.accept = this.filestackService.getFileTypes(selectedType);
          options.storeTo = this.filestackService.getS3Config(selectedType);
        }

        await this.filestackService.open(
          options,
          res => {
            this.close(res);
            return;
          },
          err => {
            // eslint-disable-next-line no-console
            console.log(err);
          }
        );
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
