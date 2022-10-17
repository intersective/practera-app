import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-popover',
  template: '<ion-content class="ion-padding">{{name}}</ion-content>',
})
export class PopoverComponent implements OnChanges {
  @Input() name: string;

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }
}
