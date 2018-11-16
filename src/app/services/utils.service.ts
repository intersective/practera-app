import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class UtilsService {
  private lodash;

  constructor() {
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
}
