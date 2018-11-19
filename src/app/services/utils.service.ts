import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ModalController } from '@ionic/angular';
import { PopUpComponent } from '@components/pop-up/pop-up.component';

@Injectable({
  providedIn: 'root'
})

export class UtilsService {
  private lodash;

  constructor(
    public modalController: ModalController
  ) {
  	if (_) {
	  	this.lodash = _;
  	} else {
  		throw "Lodash not available";
  	}
  }

  isEmpty(value: any): boolean {
    return this.lodash.isEmpty(value);
  }

  each(collections, callback) {
    return this.lodash.each(collections, callback);
  }

  unset(object, path) {
    return this.lodash.unset(object, path);
  }

  find(collections, callback) {
    return this.lodash.find(collections, callback);
  }

  remove(collections, callback) {
    return this.lodash.remove(collections, callback);
  }

  // show pop up message 
  // this is using pop-up.component.ts as the view
  // put redirect = false if don't need to redirect
  async popUp(type, data, redirect) {
    const modal = await this.modalController.create({
      component: PopUpComponent,
      componentProps: { 
        type: type,
        data: data,
        redirect: redirect
      }
    });
    return await modal.present();
  }
}
