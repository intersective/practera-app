import { Component, Input, ViewChild, ElementRef, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CircleProgressOptionsInterface } from 'ng-circle-progress';

@Component({
  selector: 'app-circle-progress',
  templateUrl: 'circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss'],
})
export class CircleProgressComponent implements OnChanges, OnInit {
  @Input() data = {};
  @Input() type: string;
  config: any;

  largePlaceholderCircle = {
    animateTitle: false,
    animation: false,
    backgroundColor: '#e6e6e6',
    backgroundPadding: 0,
    maxPercent: 100,
    outerStrokeColor: '#f0f0f0',
    outerStrokeLinecap: 'butt',
    outerStrokeWidth: 12,
    percent: 100,
    radius: 70,
    showInnerStroke: false,
    showSubtitle: false,
    showTitle: false,
    showUnits: false,
    space: -20,
    startFromZero: false,
  };

  largeCircleWithData = {
    // back to default
    animateTitle: true,
    animation: true,
    outerStrokeLinecap: 'round',
    backgroundColor: 'var(--ion-color-light)',
    outerStrokeColor: 'var(--ion-color-primary)',
    showInnerStroke: true,
    showSubtitle: true,
    showTitle: true,
    showUnits: true,
    space: 4,

    // custom
    backgroundPadding: -10,
    maxPercent: 100,
    outerStrokeWidth: 12,
    percent: 0,
    radius: 70,
    subtitle: 'COMPLETE',
    startFromZero: true,
  };

  smallPlaceholderCircle = {
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

  smallCircleWithData = {
    animateTitle: false,
    animation: true,
    backgroundColor: 'var(--ion-color-light)',
    backgroundPadding: 5,
    backgroundStrokeWidth: 2,
    maxPercent: 100,
    outerStrokeColor: 'var(--ion-color-primary)',
    innerStrokeColor: 'var(--ion-color-primary)',
    outerStrokeLinecap: 'butt',
    outerStrokeWidth: 8,
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

  @ViewChild('description') descriptionRef: ElementRef;

  ngOnInit() {
    if (this.data) {
      this.config = this.setCircleProgress(this.data);
    } else if (this.type === 'large') {
      this.config = this.largePlaceholderCircle;
    } else {
      // by default, show small circle
      this.config = this.smallPlaceholderCircle;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.config = this.setCircleProgress(changes.data.currentValue);
  }

  setCircleProgress(data: CircleProgressOptionsInterface) {
    if (this.type === 'large') {
      return Object.assign(this.largeCircleWithData, data);
    }
    return Object.assign(this.smallCircleWithData, data);
  }

}
