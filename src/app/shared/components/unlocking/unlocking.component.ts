import { Component, Input } from '@angular/core';

@Component({
  selector: 'unlocking',
  templateUrl: './unlocking.component.html',
  styleUrls: ['./unlocking.component.scss']
})
export class UnlockingComponent {
  @Input() badgeUrl: string;
  constructor(
  ) {}

}
