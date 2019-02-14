import { Component, OnInit, Input } from '@angular/core';
import { AchievementsService, Achievement } from '@app/achievements/achievements.service';

@Component({
  selector: 'achievement-badge',
  templateUrl: './achievement-badge.component.html',
  styleUrls: ['./achievement-badge.component.scss']
})
export class AchievementBadgeComponent implements OnInit {

  @Input() achievement: Achievement;

  constructor() {}

  ngOnInit() {
    this.achievement = {
      id: 1,
      name: 'first',
      description: '',
      isEarned: true,
      points: 300

    }
  }


}
