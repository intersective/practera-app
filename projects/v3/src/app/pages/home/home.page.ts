import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';
import { ActivityService } from '@v3/app/services/activity.service';
import { AssessmentService } from '@v3/app/services/assessment.service';
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

  experience$ = this.homeService.experience$;
  activityCount$ = this.homeService.activityCount$;
  experienceProgress: number;

  milestones: Milestone[];
  achievements: Achievement[];
  experience: Experience;

  subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private homeService: HomeService,
    private achievementService: AchievementService,
    private activityService: ActivityService,
    private assessmentService: AssessmentService,
    private utils: UtilsService,
    private notification: NotificationsService
  ) { }

  ngOnInit() {
    this.subscriptions = [];
    this.subscriptions.push(this.homeService.milestonesWithProgress$.subscribe(
      res => this.milestones = res
    ));
    this.subscriptions.push(this.achievementService.achievements$.subscribe(
      res => this.achievements = res
    ));
    this.subscriptions.push(this.homeService.experienceProgress$.subscribe(
      res => this.experienceProgress = res
    ));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => {
      if (subs.closed !== true) {
        subs.unsubscribe();
      }
    });
  }

  ionViewWillEnter() {
    this.homeService.getExperience()
    this.homeService.getMilestones();
    this.homeService.getProjectProgress();
    this.achievementService.getAchievements();
  }

  goBack() {
    this.router.navigate(['experiences']);
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

  gotoActivity(activity, keyboardEvent?: KeyboardEvent) {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    if (activity.isLocked) {
      return ;
    }

    this.activityService.clearActivity();
    this.assessmentService.clearAssessment();

    if (!this.utils.isMobile()) {
      return this.router.navigate(['v3', 'activity-desktop', activity.id]);
    }
    return this.router.navigate(['v3', 'activity-mobile', activity.id]);
  }

  achievePopup(achievement: Achievement, keyboardEvent?: KeyboardEvent): void {
    if (keyboardEvent && (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }
    this.notification.achievementPopUp('', achievement);
  }

  get getIsPointsConfigured() {
    return this.achievementService.getIsPointsConfigured();
  }

  get getEarnedPoints() {
    return this.achievementService.getEarnedPoints();
  }

}
