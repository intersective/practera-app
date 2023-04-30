/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { supportQuestionList  } from './support-questions';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-support-popup',
  templateUrl: './support-popup.component.html',
  styleUrls: ['./support-popup.component.scss'],
})
export class SupportPopupComponent implements OnInit {

  isShowForm: boolean = false;
  questionList = supportQuestionList;
  selectedFile: any;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

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

}
