import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PopUpComponent } from '@components/pop-up/pop-up.component';
import * as _ from 'lodash';

// @TODO: enhance Window reference later, we shouldn't refer directly to browser's window object like this
declare var window: any;

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

  indexOf(array, value, fromIndex=0) {
    return this.lodash.indexOf(array, value, fromIndex);
  }

  remove(collections, callback) {
    return this.lodash.remove(collections, callback);
  }

  openUrl(url, options?: {target: '_self'}) {
    return window.open(url, options.target);
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

  // given an array and a value, check if this value is in this array, if it is, remove it, if not, add it to the array
  addOrRemove(array: Array<any>, value) {
    let position = this.indexOf(array, value);
    if (position > -1) {
      // find the position of this value and remove it
      array.splice(position, 1);
    } else {
      // add it to the value array
      array.push(value);
    }
    return array;
  }
}
