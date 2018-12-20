import { Injectable, Inject } from '@angular/core';
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';

// @TODO: enhance Window reference later, we shouldn't refer directly to browser's window object like this
declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  private lodash;

  constructor(
    @Inject(DOCUMENT) private document: Document
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

  has(object, path) {
    return this.lodash.has(object, path);
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

  changeThemeColor(color) {
    this.document.documentElement.style.setProperty('--ion-color-primary', color);
  }
}
