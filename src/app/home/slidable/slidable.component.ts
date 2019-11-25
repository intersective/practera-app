import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-slidable',
  templateUrl: './slidable.component.html',
  styleUrls: ['./slidable.component.scss']
})
export class SlidableComponent implements OnInit {
  @Input() notifications;

  constructor() { }

  ngOnInit() {
    console.log('NOTI::', this.notifications);
  }

}
