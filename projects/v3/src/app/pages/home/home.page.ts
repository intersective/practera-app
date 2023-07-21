import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Achievement, AchievementService } from '@v3/app/services/achievement.service';
import { ActivityService } from '@v3/app/services/activity.service';
import { AssessmentService } from '@v3/app/services/assessment.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { Experience, HomeService, Milestone } from '@v3/services/home.service';
import { UtilsService } from '@v3/services/utils.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  display = 'activities';

  // experience$ = this.homeService.experience$;
  activityCount$ = this.homeService.activityCount$;
  experienceProgress: number;

  milestones: Milestone[];
  achievements: Achievement[];
  experience: Experience;

  subscriptions: Subscription[] = [];
  isMobile: boolean;
  activityProgresses = {};

  kjh;

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
    this.isMobile = this.utils.isMobile();
    this.subscriptions = [];
    this.subscriptions.push(this.homeService.projectProgress$.pipe(
      distinctUntilChanged(),
      filter(milestones => milestones !== null),
    ).subscribe(
      res => {
        this.milestones = res;
        this.kjh = res;
      }
    ));
    this.subscriptions.push(this.achievementService.achievements$.subscribe(
      res => {
        this.achievements = res;
      }
    ));
    this.subscriptions.push(this.homeService.experienceProgress$.subscribe(
      res => {
        this.experienceProgress = res;
      }
    ));
    this.subscriptions.push(this.homeService.experience$.subscribe(
      res => {
        this.experience = res;
      }
    ));
    /* this.subscriptions.push(this.homeService.projectProgress$.pipe(
      filter(progress => progress !== null),
    ).subscribe(
      progress => {
        console.log('projectProgress', progress);

        progress?.milestones.forEach(m => {
          m.activities.forEach(a => this.activityProgresses[a.id] = a.progress);
        });
      }
    )); */

    this.homeService.getMilestones();
    this.homeService.getProjectProgress();
    this.achievementService.getAchievements();
  }

  resetExperience() {
    const experience = this.experience;
    this.experience = null;
    this.experience = experience;
  }

  resetMilestones() {
    // if (this.milestones === null) {
    this.milestones = [...this.milestones, ...this.kjh];
    //   return;
    // }
    // this.kjh = this.milestones;
    // this.milestones = null;
    // this.milestones = milestones;
  }

  goBack() {
    this.router.navigate(['experiences']);
  }

  switchContent(event) {
    this.display = event.detail.value;
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

  endingProgress(progress) {
    if (!progress || progress === 1) {
      return '';
    }
    return progress;
  }

  get getIsPointsConfigured() {
    return this.achievementService.getIsPointsConfigured();
  }

  get getEarnedPoints() {
    return this.achievementService.getEarnedPoints();
  }

}
