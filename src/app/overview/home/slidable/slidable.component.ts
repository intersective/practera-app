import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UtilsService } from '@services/utils.service';
import * as moment from 'moment';

@Component({
  selector: 'app-slidable',
  templateUrl: './slidable.component.html',
  styleUrls: ['./slidable.component.scss']
})
export class SlidableComponent implements OnInit, OnChanges {
  @Input() notifications;
  // Optional parameters to pass to the swiper instance. See http://idangero.us/swiper/api/ for valid options.
  slideOpts: any;

  constructor(private utils: UtilsService) { }

  ngOnInit() {
    this.slideOpts = {
      // width: 300,
      centeredSlides: true,
      initialSlide: 0,
      loop: true,
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 400,
      // setTranslate:
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        /*renderBullet: function (index, className) {
          return '<span class="' + className + '">' + (index + 1) + '</span>';
        },*/
      },
      on: {
        beforeInit: function() {
          console.log('on slider:init');
          console.log(arguments);
        },
        setTransition: function(duration) {
          const swiper = this;

          /*
          try to inject recalucated sizes for each grid
          swiper.slidesSizeGrid = this.utils.each(swiper.slidesSizeGrid, size => {
            return (size * 0.9);
          });*/

          swiper.slides
            .transition(duration)
            .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
            .transition(duration);
        },
        setTranslate: function() {
          const swiper = this;
          const {
            width: swiperWidth,
            height: swiperHeight,
            slides,
            $wrapperEl,
            slidesSizesGrid
          } = swiper;

          const params = swiper.params;
console.log('params::', params);
          const isHorizontal = swiper.isHorizontal();
          const transform$$1 = swiper.translate;
          const center = isHorizontal ? -transform$$1 + (swiperWidth / 2) : -transform$$1 + (swiperHeight / 2);
          const rotate = isHorizontal ? params.rotate : -params.rotate;
          const translate = params.depth;

          // Each slide offset from center
          for (let i = 0, length = slides.length; i < length; i += 1) {
            const $slideEl = slides.eq(i);
            const slideSize = slidesSizesGrid[i];
            const slideOffset = $slideEl[0].swiperSlideOffset;
            const offsetMultiplier = ((center - slideOffset - (slideSize / 2)) / slideSize) * params.modifier;

            let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
            let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
            // var rotateZ = 0
            let translateZ = -translate * Math.abs(offsetMultiplier);

            let translateY = isHorizontal ? 0 : params.stretch * (offsetMultiplier);
            let translateX = isHorizontal ? params.stretch * (offsetMultiplier) : 0;

            // Fix for ultra small values
            if (Math.abs(translateX) < 0.001) translateX = 0;
            if (Math.abs(translateY) < 0.001) translateY = 0;
            if (Math.abs(translateZ) < 0.001) translateZ = 0;
            if (Math.abs(rotateY) < 0.001) rotateY = 0;
            if (Math.abs(rotateX) < 0.001) rotateX = 0;

            const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            $slideEl.transform(slideTransform);
            $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
          }
        }
      }
    };
    this.notifications = this.reorder(this.notifications);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.notifications = this.reorder(changes.notifications.currentValue);

    if (this.slideOpts) {
      this.slideOpts.loop = false;
      if ((this.notifications || []).length > 1) {
         this.slideOpts.loop = true;
      }
    }
  }

  reorder(raw) {
    const ordered = (raw || []).sort((a, b) => {
      if (a.meta && a.meta.published_date && b.meta && b.meta.published_date) {
        return moment(a.meta.published_date).isAfter(b.meta.published_date);
      }
      return false;
    });
    return ordered;
  }
}
