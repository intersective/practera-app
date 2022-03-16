import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';
import { HomeService } from '@v3/services/home.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  display = 'activities';

  experience$ = this.service.experience$;
  activityCount$ = this.service.activityCount$;
  experienceProgress$ = this.service.experienceProgress$;
  milestones$ = this.service.milestonesWithProgress$;
  achievements$ = this.achievementService.achievements$;

  constructor(
    private route: ActivatedRoute,
    private service: HomeService,
    private achievementService: AchievementService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.service.getExperience();
      this.service.getMilestones();
      this.service.getProjectProgress();
      this.achievementService.getAchievements();
    });
  }

  switchContent(event) {
    this.display = event.detail.value;
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  endingIcon(progress) {
    if (!progress) {
      return 'chevron-forward';
    }
    if (progress === 1) {
      return 'checkmark-circle';
    }
    return '';
  }

  endingIconColor(progress) {
    if (!progress) {
      return 'medium';
    }
    if (progress === 1) {
      return 'success';
    }
    return '';
  }

  endingProgress(progress) {
    if (!progress || progress === 1) {
      return '';
    }
    return progress;
  }

  gotoActivity(id: number) {
    console.log(id);
  }

  achievePopup(achievement: Achievement) {
    console.log(achievement);
  }
}
