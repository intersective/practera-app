import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  Achievement,
  AchievementService,
} from '@v3/app/services/achievement.service';
import { ActivityService } from '@v3/app/services/activity.service';
import { AssessmentService } from '@v3/app/services/assessment.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { SharedService } from '@v3/app/services/shared.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { Experience, HomeService, Milestone } from '@v3/services/home.service';
import { UtilsService } from '@v3/services/utils.service';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, first } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  display = 'activities';

  activityCount$: Observable<number>;
  experienceProgress: number;

  milestones: Milestone[];
  achievements: Achievement[];
  experience: Experience;

  subscriptions: Subscription[] = [];
  isMobile: boolean;
  activityProgresses = {};

  getIsPointsConfigured: boolean = false;
  getEarnedPoints: number = 0;
  hasUnlockedTasks: Object = {};
  unlockedMilestones: { [key: number]: boolean } = {};

  // default card image (gracefully show broken url)
  defaultLeadImage: string = '';

  constructor(
    private router: Router,
    private homeService: HomeService,
    private achievementService: AchievementService,
    private activityService: ActivityService,
    private assessmentService: AssessmentService,
    private utils: UtilsService,
    private notification: NotificationsService,
    private sharedService: SharedService,
    private storageService: BrowserStorageService,
    private unlockIndicatorService: UnlockIndicatorService
  ) {
    this.activityCount$ = homeService.activityCount$;
  }

  ngOnInit() {
    this.isMobile = this.utils.isMobile();
    this.subscriptions = [];
    this.subscriptions.push(
      this.homeService.milestones$
        .pipe(
          distinctUntilChanged(),
          filter((milestones) => milestones !== null)
        )
        .subscribe((res) => {
          this.milestones = res;
        })
    );
    this.subscriptions.push(
      this.achievementService.achievements$.subscribe((res) => {
        this.achievements = res;
      })
    );
    this.subscriptions.push(
      this.homeService.experienceProgress$.subscribe((res) => {
        this.experienceProgress = res;
      })
    );
    this.subscriptions.push(
      this.homeService.projectProgress$
        .pipe(filter((progress) => progress !== null))
        .subscribe((progress) => {
          progress?.milestones?.forEach((m) => {
            m.activities?.forEach(
              (a) => (this.activityProgresses[a.id] = a.progress)
            );
          });
        })
    );

    this.subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateDashboard();
        }
      })
    );

    this.unlockIndicatorService.unlockedTasks$.subscribe((unlockedTasks) => {
      this.hasUnlockedTasks = {}; // reset
      this.unlockedMilestones = {}; // reset
      unlockedTasks.forEach((task) => {
        if (task.milestoneId) {
          if (this.unlockIndicatorService.isMilestoneClearable(task.milestoneId)) {
            this.verifyUnlockedMilestoneValidity(task.milestoneId);
          } else {
            this.unlockedMilestones[task.milestoneId] = true;
          }
        }

        if (task.activityId) {
          this.hasUnlockedTasks[task.activityId] = true;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  async updateDashboard() {
    await this.sharedService.refreshJWT(); // refresh JWT token [CORE-6083]
    this.experience = this.storageService.get('experience');
    this.homeService.getMilestones();
    this.achievementService.getAchievements();
    this.homeService.getProjectProgress();

    this.utils.setPageTitle(this.experience?.name || 'Practera');
    this.defaultLeadImage = this.experience.cardUrl || '';
  }

  goBack() {
    this.router.navigate(['experiences']);
  }

  switchContent(event) {
    // update points upon switching to badges tab
    if (event.detail.value === 'badges') {
      this.getIsPointsConfigured = this.achievementService.isPointsConfigured;
      this.getEarnedPoints = this.achievementService.earnedPoints;
    }
    this.display = event.detail.value;
  }

  endingIcon(activity) {
    if (activity.isLocked) {
      return 'lock-closed';
    }
    const progress = this.activityProgresses[activity.id];
    if (!progress) {
      return 'chevron-forward';
    }
    if (progress === 1) {
      return 'checkmark-circle';
    }
    return null;
  }

  endingIconColor(activity) {
    const progress = this.activityProgresses[activity.id];
    if (!progress || activity.isLocked) {
      return 'medium';
    }
    if (progress === 1) {
      return 'success';
    }
    return null;
  }

  /**
   * Navigates to the activity page when an activity is clicked or the enter/space key is pressed.
   * If the activity is locked, nothing happens.
   * Clears the activity and assessment services before navigating.
   * If the user is not in a team, an alert is shown.
   * If the user is on desktop, navigates to the desktop activity page.
   * If the user is on mobile, navigates to the mobile activity page.
   * @param activity The activity object to navigate to.
   * @param keyboardEvent The keyboard event object, if the function was called by a keyboard event.
   * @returns A Promise that resolves when the navigation is complete.
   */
  async gotoActivity({ activity, milestone }, keyboardEvent?: KeyboardEvent) {
    if (
      keyboardEvent &&
      (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')
    ) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    if (activity.isLocked) {
      return;
    }

    this.activityService.clearActivity();
    this.assessmentService.clearAssessment();

    if (this.unlockIndicatorService.isMilestoneClearable(milestone.id)) {
      this.verifyUnlockedMilestoneValidity(milestone.id);
    }

    if (!this.isMobile) {
      return this.router.navigate(['v3', 'activity-desktop', activity.id]);
    }

    return this.router.navigate(['v3', 'activity-mobile', activity.id]);
  }

  verifyUnlockedMilestoneValidity(milestoneId: number): void {
    // check & update unlocked milestones
    const unlockedMilestones =
      this.unlockIndicatorService.clearActivity(milestoneId);
    unlockedMilestones.forEach((unlockedMilestone) => {
      this.notification
        .markTodoItemAsDone(unlockedMilestone)
        .pipe(first())
        .subscribe(() => {
          // eslint-disable-next-line no-console
          console.log('Marked milestone as done', unlockedMilestone);
        });
    });
  }

  achievePopup(achievement: Achievement, keyboardEvent?: KeyboardEvent): void {
    if (
      keyboardEvent &&
      (keyboardEvent?.code === 'Space' || keyboardEvent?.code === 'Enter')
    ) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }
    this.notification.achievementPopUp('', achievement);
  }

  endingProgress(activity): number {
    const progress = this.activityProgresses[activity.id];
    if (!progress || progress === 1) {
      return undefined;
    }
    return progress;
  }
}
