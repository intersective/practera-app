import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { FilestackService } from '@v3/services/filestack.service';

@Component({
  selector: 'app-attachment-popover',
  templateUrl: './attachment-popover.component.html',
  styleUrls: ['./attachment-popover.component.scss'],
})
export class AttachmentPopoverComponent{

  constructor(
    private popoverController: PopoverController,
    private filestackService: FilestackService
  ) { }

    /**
   * This will cloase the group chat popup
   */
    close(selectedFile = null) {
      this.popoverController.dismiss({
        selectedFile: selectedFile
      });
    }

    async openAttachPopup(selectedType) {
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
          console.log(err);
        }
      );
    }

}
