import { Component, Input, ViewChild, ElementRef, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CircleProgressOptionsInterface } from 'ng-circle-progress';

@Component({
  selector: 'app-circle-progress',
  templateUrl: 'circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss'],
})
export class CircleProgressComponent implements OnChanges, OnInit {
  // default - gray out
  config = {
    animateTitle: false,
    animation: false,
    backgroundColor: '#e6e6e6',
    backgroundPadding: 0,
    backgroundStrokeWidth: 0,
    maxPercent: 100,
    outerStrokeColor: '#f0f0f0',
    outerStrokeLinecap: 'butt',
    outerStrokeWidth: 3,
    percent: 100,
    radius: 19,
    showInnerStroke: false,
    showSubtitle: false,
    showTitle: false,
    showUnits: false,
    space: -20,
    startFromZero: false,
    toFixed: 0,
  };

  @Input() data = {};
  @ViewChild('description') descriptionRef: ElementRef;

  ngOnInit() {
    if (this.data) {
      this.config = this.setCircleProgress(this.data);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.config = this.setCircleProgress(changes.data.currentValue);
  }

  setCircleProgress(data: CircleProgressOptionsInterface) {
    const result = this.config;

    // clear everything
    const after = {
      animateTitle: false,
      animation: true,
      backgroundColor: 'var(--ion-color-light)',
      backgroundPadding: 5,
      backgroundStrokeWidth: 2,
      maxPercent: 100,
      outerStrokeColor: 'var(--ion-color-primary)',
      innerStrokeColor: 'var(--ion-color-primary)',
      outerStrokeLinecap: 'butt',
      outerStrokeWidth: 10,
      showInnerStroke: false,
      showSubtitle: false,
      showTitle: false,
      subtitleColor: 'var(--ion-color-dark-tint)',
      showUnits: false,
      space: -20,
      percent: 0,
      radius: 5,
      subtitle: false,
      startFromZero: true,
      toFixed: 0,
    };

    if (data && data.percent >= 0) {
      return Object.assign(after, data);
    }

    return result;
  }

}
