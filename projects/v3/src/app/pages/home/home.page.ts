import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';
import { Activity } from '@v3/app/services/activity.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { Experience, HomeService, Milestone } from '@v3/services/home.service';
import { UtilsService } from '@v3/services/utils.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  display = 'activities';

  experience$ = this.service.experience$;
  activityCount$ = this.service.activityCount$;
  experienceProgress$ = this.service.experienceProgress$;

  milestones: Milestone[];
  achievements: Achievement[];
  experience: Experience;

  subscriptions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HomeService,
    private achievementService: AchievementService,
    private utils: UtilsService,
    private notification: NotificationsService
  ) { }

  ngOnInit() {
    this.subscriptions[1] = this.service.milestonesWithProgress$.subscribe(res => this.milestones = res);
    this.subscriptions[2] = this.achievementService.achievements$.subscribe(res => this.achievements = res);
    this.subscriptions[3] = this.route.params.subscribe(params => {
      this.service.getExperience();
      this.service.getMilestones();
      this.service.getProjectProgress();
      this.achievementService.getAchievements();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());
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
