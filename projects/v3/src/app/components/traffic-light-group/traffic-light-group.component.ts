import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-traffic-light-group',
  templateUrl: './traffic-light-group.component.html',
  styleUrls: ['./traffic-light-group.component.scss']
})

export class TrafficLightGroupComponent {
  @Input() lights: { groupLabel: string, group: { value: number | null, label: string}[] };
}
