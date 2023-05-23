/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { supportQuestionList  } from './support-questions';
import { ModalController } from '@ionic/angular';
import { HubspotService, HubspotFormParams } from '@v3/services/hubspot.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  selector: 'app-support-popup',
  templateUrl: './support-popup.component.html',
  styleUrls: ['./support-popup.component.scss'],
})
export class SupportPopupComponent implements OnInit {

  isShowForm: boolean = false;
  isShowSuccess: boolean = false;
  isShowError: boolean = false;
  questionList = supportQuestionList;
  selectedFile: any;
  problemSubject: string;
  problemContent: string;
  isShowFormOnly?: boolean;

  constructor(
    private modalController: ModalController,
    private hubspotService: HubspotService,
    private utilService: UtilsService
  ) { }

  ngOnInit() {
    if (this.isShowFormOnly == true) {
      this.isShowForm = true;
    }
  }

  showSupportForm() {
    this.isShowForm = !this.isShowForm;
  }

  closePopup() {
    this.modalController.dismiss();
  }

  onFileSelect(event) {
    if (event?.target?.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  removeSelectedFile() {
    this.selectedFile = undefined;
  }

  submitForm() {
    if (this.utilService.isEmpty(this.problemSubject) ||
    this.utilService.isEmpty(this.problemContent)) {
      return;
    }
    const param: HubspotFormParams = {
      subject: this.problemSubject,
      content: this.problemContent,
      file: JSON.stringify(this.selectedFile)
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
