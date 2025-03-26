import { FastFeedbackService } from "@v3/services/fast-feedback.service";
import { Component, Input } from "@angular/core";
import { BrowserStorageService } from "@v3/app/services/storage.service";

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
    teams: { teamName: string, average: number }[];
  };
  @Input() displayOnly: boolean = false;
  loading: {
    [key: string]: boolean;
  } = {};

  constructor(
    private fastFeedbackService: FastFeedbackService,
    private storageService: BrowserStorageService,
  ) {}

  get isMentor(): boolean {
    return this.storageService.getUser().role === 'mentor';
  }

  get learnerGroups(): string[] {
    return ['self', 'team', 'expert'];
  }

  get teamGroups(): { teamName: string, average: number }[] {
    return this.lights?.teams || [];
  }

  navigateToPulseCheck(type: string) {
    if (!this.loading[type]) {
      this.loading[type] = true;
      this.fastFeedbackService.pullFastFeedback({
        closable: true,
        skipChecking: true
      }).subscribe({
        next: (response) => {
          if (response) {
            console.log(`Pulled fast feedback for type ${type}:`, response);
          }
        },
        error: (error) => {
          console.error(`Error pulling fast feedback for type ${type}:`, error);
        },
        complete: () => {
          this.storageService.set('fastFeedbackOpening', false);
          this.loading[type] = false;
        },
      });
    }
  }
}
