import { Pipe, PipeTransform } from '@angular/core';
import linkifyStr from 'linkifyjs/string';

@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

  transform(value: string, target: string, args?: any): any {
    return value ? linkifyStr(value, {target: target}) : value;
  }

}
