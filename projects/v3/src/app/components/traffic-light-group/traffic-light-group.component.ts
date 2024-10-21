import { FastFeedbackService } from "@v3/services/fast-feedback.service";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-traffic-light-group",
  templateUrl: "./traffic-light-group.component.html",
  styleUrls: ["./traffic-light-group.component.scss"],
})
export class TrafficLightGroupComponent {
  // @Input() lights: { groupLabel: string, group: { value: number | null, label: string}[] };
  @Input() lights: {
    self: any;
    expert: any;
    team: any;
  };
  loading: {
    [key: string]: boolean;
  } = {};

  constructor(private fastFeedbackService: FastFeedbackService) {}

  navigateToPulseCheck(type: string) {
    if (!this.loading[type]) {
      this.loading[type] = true;
      this.fastFeedbackService.pullFastFeedback().subscribe({
        next: (response) => {
          if (response) {
            console.log(`Pulled fast feedback for type ${type}:`, response);
          }
        },
        error: (error) => {
          console.error(`Error pulling fast feedback for type ${type}:`, error);
        },
        complete: () => {
          this.loading[type] = false;
        },
      });
    }
  }
}
