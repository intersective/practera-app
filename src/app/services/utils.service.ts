import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})

export class UtilsService {
  isEmpty(value: any): boolean {
    return _.isEmpty(value);
  }

  each = _.each
}
