import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AchievementsService, Achievement } from './achievements.service';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';

@Component({
  selector: 'app-achievements',
  templateUrl: 'achievements.component.html',
  styleUrls: ['achievements.component.scss']
})
export class AchievementsComponent extends RouterEnter {
  routeUrl = '/achievements';
  achievements: Array<Achievement>;
  loadingAchievements = true;
  totalEarnedPoints: number;

  constructor (
    public router: Router,
    private achievementService: AchievementsService,
    public utils: UtilsService
  ) {
    super(router);
  }

  onEnter() {
    this.achievementService.getAchievements().subscribe(achievements => {
      this.achievements = achievements;
      this.loadingAchievements = false;
      this.countTotalEarnedPoints();
    });
  }

  back() {
    this.router.navigate(['app', 'home']);
  }

  countTotalEarnedPoints() {
    this.totalEarnedPoints = 0;
    this.achievements.forEach(achievement => {
      if (achievement.isEarned && achievement.points > 0) {
        this.totalEarnedPoints += achievement.points;
      }
    });
  }

}
