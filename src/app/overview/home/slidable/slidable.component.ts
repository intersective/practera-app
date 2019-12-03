import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-slidable',
  templateUrl: './slidable.component.html',
  styleUrls: ['./slidable.component.scss']
})
export class SlidableComponent implements OnInit, OnChanges {
  @Input() notifications;
  // Optional parameters to pass to the swiper instance. See http://idangero.us/swiper/api/ for valid options.
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };

  constructor() { }

  ngOnInit() {
    console.log('NOTI::', this.notifications);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }
}
