/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import * as filestack from 'filestack-js';
import { Component, OnInit } from '@angular/core';
import { supportQuestionList  } from './support-questions';
import { ModalController } from '@ionic/angular';
import { HubspotService, HubspotFormParams } from '@v3/services/hubspot.service';
import { FilestackService } from '@v3/app/services/filestack.service';
import { UtilsService } from '@v3/services/utils.service';

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
  isShowFormOnly?: boolean;

  constructor(
    private modalController: ModalController,
    private hubspotService: HubspotService,
    private filestackService: FilestackService,
    private utilService: UtilsService
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

  ionViewWillLeave() {
    // if fileupload has been initiated earlier, delete the file from filestack
    if (this.selectedFile) {
      this.filestackService.deleteFile(this.selectedFile.handle).toPromise();
    }
  }

  closePopup() {
    this.modalController.dismiss();
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
