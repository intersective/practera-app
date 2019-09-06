import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss']
})
export class CustomToastComponent implements OnInit {

  icon: string;
  message: string;
  duration = 2000;

  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.modalController.dismiss();
    // tslint:disable-next-line:align
    }, this.duration);
  }

}
