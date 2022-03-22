import { Pipe, PipeTransform } from '@angular/core';
import { filter } from 'lodash';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], matching: {
    [prop: string]: string | boolean;
  }): any {
    if (!items || !matching) {
      return items;
    }

    return filter(items, matching);
  }
}
