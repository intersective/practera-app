import { Component, Input, ViewChild, ElementRef, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CircleProgressOptionsInterface } from 'ng-circle-progress';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-circle-progress',
  templateUrl: 'circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss'],
})
export class CircleProgressComponent implements OnChanges, OnInit {
  @Input() data = {};
  @Input() type: string;
  @Input() loading = false;
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
    innerStrokeWidth: 4,
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
    outerStrokeWidth: 8,
    outerStrokeColor: '#f0f0f0',
    backgroundColor: '#e6e6e6',
    backgroundStrokeWidth: 1,
    backgroundPadding: 8,
    maxPercent: 100,
    outerStrokeLinecap: 'butt',
    percent: 100,
    radius: 15,
    showInnerStroke: true,
    showSubtitle: false,
    showTitle: false,
    showUnits: false,
    space: -15,
    startFromZero: false,
    toFixed: 0,
    subtitle: false,
  };

  smallCircleWithData = {
    animation: true,
    backgroundColor: 'var(--ion-color-light)',
    maxPercent: 100,
    innerStrokeWidth: 2,
    outerStrokeColor: 'var(--ion-color-primary)',
    percent: 0,
    space: -12,
    radius: 4,
    startFromZero: true,
  };

  @ViewChild('description') descriptionRef: ElementRef;

  constructor (
    public utils: UtilsService
  ) {}

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
    if (changes.data) {
      this.config = this.setCircleProgress(changes.data.currentValue);
    }
  }

  setCircleProgress(data: CircleProgressOptionsInterface) {
    if (this.type === 'large') {
      return {...this.largePlaceholderCircle, ...this.largeCircleWithData, ...data};
    }
    return {...this.smallPlaceholderCircle, ...this.smallCircleWithData, ...data};
  }

}
