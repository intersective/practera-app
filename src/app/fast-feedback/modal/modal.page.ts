import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
	templateUrl: './modal.page.html',
})

export class ModalPage {
	questions: any[];

	constructor(private modalCtrl: ModalController) {}

	dismiss() {
	    this.modalCtrl.dismiss();
	}
}