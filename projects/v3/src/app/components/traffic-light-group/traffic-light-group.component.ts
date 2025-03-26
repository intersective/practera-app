import { FastFeedbackService } from "@v3/services/fast-feedback.service";
import { Component, Input } from "@angular/core";
import { BrowserStorageService } from "@v3/app/services/storage.service";
import { AlertController } from '@ionic/angular';

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
    private alertController: AlertController
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

  async navigateToPulseCheck(type: string) {
    if (this.displayOnly) {
      return;
    }

    this.loading[type] = true;
    await this.fastFeedbackService.pullFastFeedback({
      skipChecking: true,
      closable: true
    }).subscribe();
    this.storageService.set('fastFeedbackOpening', false);
    this.loading[type] = false;
  }

  async handleTrafficLightClick(group: string, value: number) {
    if (group === 'self') {
      await this.navigateToPulseCheck(group);
      return;
    }

    if (value === null || value === undefined || value > 0.65) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Team Check-In Time! 👥',
      message: `Your status update shows some misalignment. Great opportunity to:\n\n` +
        `✓ Schedule a quick team huddle\n` +
        `✓ Review your Project plan and milestones together\n` +
        `✓ Redistribute tasks if needed\n` +
        `✓ Document 3 next steps forward\n\n` +
        `Need strategies? Visit Teamwork Toolkit →\n` +
        `We're here to help: programs@practera.com`,
      buttons: ['OK'],
      cssClass: 'team-check-in-alert'
    });

    await alert.present();
  }

}
