import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { UtilsService } from '@services/utils.service';
import * as moment from 'moment';

@Component({
  selector: 'app-slidable',
  templateUrl: './slidable.component.html',
  styleUrls: ['./slidable.component.scss']
})
export class SlidableComponent implements OnInit, OnChanges {
  @Input() notifications;
  @Output() goto = new EventEmitter<any>();
  slideOpts: any;

  constructor(private utils: UtilsService) { }

  ngOnInit() {
    // Optional parameters to pass to the swiper instance.
    // See http://idangero.us/swiper/api/ for valid options.
    this.slideOpts = {
      centeredSlides: true,
      initialSlide: 0,
      slidesPerView: 1.18,
      spaceBetween: 10,
      speed: 400,
    };
    this.notifications = this.reorder(this.notifications);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.notifications = this.reorder(changes.notifications.currentValue);
    // this.notifications = this.reorder(this.findAndNormaliseEvent(changes.notifications.currentValue));
  }

  // sort notifications list by datetime
  reorder(raw) {
    const ordered = (raw || []).sort((a, b) => {
      if (a.meta && a.meta.published_date && b.meta && b.meta.published_date) {
        return moment(a.meta.published_date).isAfter(b.meta.published_date);
      }
      return false;
    });
    return ordered;
  }

  // restructure eventReminder data to adopt todoItem object format
  findAndNormaliseEvent(items) {
    return items.map(item => {
      if (!item.type) {
        return {
          name: item.name,
          description: '',
          type: 'event',
          time: this.utils.timeFormatter(item.startTime)
        };
      }
      return item;
    });
  }

  navigate(item) {
    return this.goto.emit(item);
  }
}
