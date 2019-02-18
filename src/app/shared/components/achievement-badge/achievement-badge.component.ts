import { Component, Input } from '@angular/core';
import { AchievementsService, Achievement } from '@app/achievements/achievements.service';

@Component({
  selector: 'achievement-badge',
  templateUrl: './achievement-badge.component.html',
  styleUrls: ['./achievement-badge.component.scss']
})
export class AchievementBadgeComponent {

  @Input() achievement: Achievement;
  @Input() showName: Boolean = false;

  constructor() {}

  showAchievementDetails () {
    console.log("achievement detail:", this.achievement);
  }

}
