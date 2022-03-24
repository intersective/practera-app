import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
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
    private router: Router,
    private service: HomeService,
    private achievementService: AchievementService,
    private utils: UtilsService,
    private notification: NotificationsService
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
    this.router.navigate(['v3', 'activity-desktop', id]);
  }

  achievePopup(achievement: Achievement) {
    this.notification.achievementPopUp('', achievement);
  }
}
