import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-traffic-light',
  templateUrl: './traffic-light.component.html',
  styleUrls: ['./traffic-light.component.scss']
})
export class TrafficLightComponent {
  @Input() value: number | null = null;

  get color(): string {
    if (this.value === null || this.value === undefined) {
      return 'grey'; // No data
    } else if (this.value < 0.4) {
      return 'red';
    } else if (this.value > 0.7) {
      return 'green';
    } else {
      return 'yellow';
    }
  }
}