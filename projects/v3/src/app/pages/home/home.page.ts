import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';
import { Activity } from '@v3/app/services/activity.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { HomeService, Milestone } from '@v3/services/home.service';
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

  milestones: Milestone[];
  achievements: Achievement[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HomeService,
    private achievementService: AchievementService,
    private utils: UtilsService,
    private notification: NotificationsService
  ) { }

  ngOnInit() {
    this.service.milestonesWithProgress$.subscribe(res => this.milestones = res);
    this.achievementService.achievements$.subscribe(res => this.achievements = res);
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

  endingIcon(activity) {
    if (activity.isLocked) {
      return 'lock-closed';
    }
    if (!activity.progress) {
      return 'chevron-forward';
    }
    if (activity.progress === 1) {
      return 'checkmark-circle';
    }
    return '';
  }

  endingIconColor(activity) {
    if (!activity.progress || activity.isLocked) {
      return 'medium';
    }
    if (activity.progress === 1) {
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

  gotoActivity(activity) {
    if (activity.isLocked) {
      return ;
    }
    if (!this.utils.isMobile()) {
      return this.router.navigate(['v3', 'activity-desktop', activity.id]);
    }
    return this.router.navigate(['v3', 'activity-mobile', activity.id]);
  }

  achievePopup(achievement: Achievement) {
    this.notification.achievementPopUp('', achievement);
  }
}
