import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-traffic-light',
  templateUrl: './traffic-light.component.html',
  styleUrls: ['./traffic-light.component.scss']
})
export class TrafficLightComponent {
  @Input() value: number | null = null;
  @Input() icon?: string;

  get color(): string {
    if (this.value === null || this.value === undefined) {
      return 'grey'; // No data
    } else if (this.value < 0.32) {
      return 'red';
    } else if (this.value > 0.65) {
      return 'green';
    } else {
      return 'orange';
    }
  }

}
