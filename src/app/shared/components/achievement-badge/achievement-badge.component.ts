import { Component, Input } from '@angular/core';
import { AchievementsService, Achievement } from '@app/achievements/achievements.service';
import { NotificationService } from '@shared/notification/notification.service';

@Component({
  selector: 'achievement-badge',
  templateUrl: './achievement-badge.component.html',
  styleUrls: ['./achievement-badge.component.scss']
})
export class AchievementBadgeComponent {

  @Input() achievement: Achievement;
  @Input() showName: Boolean = false;

  constructor(
    private notificationService: NotificationService
  ) {}

  showAchievementDetails() {
    this.notificationService.achievementPopUp('', this.achievement);
  }

}
