/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import * as filestack from 'filestack-js';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { supportQuestionList  } from './support-questions';
import { ModalController } from '@ionic/angular';
import { HubspotService, HubspotFormParams } from '@v3/services/hubspot.service';
import { FilestackService } from '@v3/app/services/filestack.service';
import { UtilsService } from '@v3/services/utils.service';
import { NotificationsService } from '@v3/app/services/notifications.service';

@Component({
  selector: 'app-support-popup',
  templateUrl: './support-popup.component.html',
  styleUrls: ['./support-popup.component.scss'],
})
export class SupportPopupComponent implements OnInit {
  protected filestack = filestack.Client;
  isShowForm: boolean = false;
  isShowSuccess: boolean = false;
  isShowError: boolean = false;
  isShowRequiredError: boolean = false;
  questionList = supportQuestionList;
  selectedFile: any;
  problemSubject: string;
  problemContent: string;
  @Input() isShowFormOnly?: boolean;
  hasConsent: boolean = false;

  constructor(
    private modalController: ModalController,
    private hubspotService: HubspotService,
    private filestackService: FilestackService,
    private utilService: UtilsService,
    private notificationsService: NotificationsService,
  ) { }

  ngOnInit() {
    if (this.isShowFormOnly == true) {
      this.isShowForm = true;
    }
  }

  showSupportForm() {
    this.isShowForm = !this.isShowForm;
    this.isShowRequiredError = false;
    this.isShowSuccess = false;
    this.isShowError = false;
  }

  isPristine() {
    return !this.problemSubject && !this.problemContent && !this.selectedFile;
  }

  canDismiss(modal) {
    modal.canDismiss = true;

    if (this.problemSubject || this.problemContent || this.selectedFile) {
      return this.notificationsService.alert({
        header: 'Are you sure?',
        message: 'Your changes will be lost if you leave this page.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              modal.canDismiss = false;
            },
          },
          {
            text: 'Leave',
            handler: () => {
              // if fileupload has been initiated earlier, delete the file from filestack
              if (this.selectedFile) {
                this.filestackService.deleteFile(this.selectedFile.handle).toPromise();
              }

              this.modalController.dismiss({
                isPristine: this.isPristine()
              });
            }
          }
        ]
      });
    }

    return this.modalController.dismiss();
  }

  async closePopup() {
    this.modalController.getTop().then(async (modal) => {
      await this.canDismiss(modal);
    });
  }

  onFileSelect(event) {
    const file: File = event.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file, file.name);

      this.selectedFile = file;
    }
  }

  async removeSelectedFile() {
    await this.filestackService.deleteFile(this.selectedFile.handle).toPromise();
    this.selectedFile = undefined;
  }

  async uploadFile(keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    const pickerOptions: filestack.PickerOptions = {
      storeTo: this.filestackService.getS3Config('any'),
      onFileUploadFailed: data => {
        this.selectedFile = undefined;
      },
      onFileUploadFinished: data => {
        this.selectedFile = data;
      },
      onOpen: () => { // for accessibility
        setTimeout(() => {
          const eles = document.getElementsByClassName('fsp-picker__close-button');
          if (eles.length > 0) {
            (eles[0] as HTMLElement).focus();
          }
        }, 850);
      },
    };

    try {
      const res = await this.filestackService.open(pickerOptions);
      return res;
    } catch (err) {
      throw new Error(err);
    }
  }

  submitForm() {
    this.isShowRequiredError = false;
    this.isShowSuccess = false;
    this.isShowError = false;
    if (this.utilService.isEmpty(this.problemSubject) ||
    this.utilService.isEmpty(this.problemContent)) {
      this.isShowRequiredError = true;
      return;
    }
    const param: HubspotFormParams = {
      subject: this.problemSubject,
      content: this.problemContent,
      file: this.selectedFile?.url,
      consentToProcess: this.hasConsent,
    }
    this.hubspotService.submitDataToHubspot(param).subscribe(
      (response) => {
        this.selectedFile = undefined;
        this.problemContent = '';
        this.problemSubject = '';
        this.isShowSuccess = true;
        this.isShowError = false;
      },
      (error) => {
        this.selectedFile = undefined;
        this.problemContent = '';
        this.problemSubject = '';
        this.isShowSuccess = false;
        this.isShowError = true;
      }
    );
  }

}
