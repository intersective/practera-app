import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked, ElementRef, ChangeDetectorRef, isDevMode } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TrafficLightGroupComponent } from '@v3/app/components/traffic-light-group/traffic-light-group.component';
import {
  Achievement,
  AchievementService,
} from '@v3/app/services/achievement.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { SharedService } from '@v3/app/services/shared.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { Experience, HomeService, Milestone, PulseCheckSkill } from '@v3/services/home.service';
import { UtilsService } from '@v3/services/utils.service';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, first, takeUntil } from 'rxjs/operators';
import { FastFeedbackService } from '@v3/app/services/fast-feedback.service';
import { AlertController } from '@ionic/angular';
import { Activity } from '@v3/app/services/activity.service';
import { PulsecheckService } from '@v3/app/services/pulsecheck.service';

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit, OnDestroy, AfterViewChecked {
  display = 'activities';

  activityCount$: Observable<number>;
  experienceProgress: number;
  pulseCheckStatus: TrafficLightGroupComponent["lights"];
  milestones: Milestone[];
  achievements: Achievement[];
  experience: Experience;

  isMobile: boolean;
  isParticipant: boolean;
  pulseCheckIndicatorEnabled: boolean;
  activityProgresses = {};

  getIsPointsConfigured: boolean = false;
  getEarnedPoints: number = 0;
  hasUnlockedTasks: Object = {};

  // default card image (gracefully show broken url)
  defaultLeadImage: string = "";

  lastVisitedActivityId: number = null;
  bookmarkedActivities: {
    [key: number]: boolean;
  } = {};

  unsubscribe$ = new Subject();
  milestones$: Observable<Milestone[]>;

  @ViewChild('activityCol') activityCol: { el: HTMLIonColElement };
  @ViewChild('activities', { static: false }) activities!: ElementRef;
  pulseCheckSkills: PulseCheckSkill[] = [];

  // Expose Math to template
  Math = Math;


  constructor(
    private router: Router,
    private homeService: HomeService,
    private achievementService: AchievementService,
    private utils: UtilsService,
    private notification: NotificationsService,
    private sharedService: SharedService,
    private storageService: BrowserStorageService,
    private unlockIndicatorService: UnlockIndicatorService,
    private cdr: ChangeDetectorRef,
    private fastFeedbackService: FastFeedbackService,
    private alertController: AlertController,
    private pulsecheckService: PulsecheckService,
  ) {
    this.activityCount$ = homeService.activityCount$;
  }

  ngAfterViewChecked() {
    const id = this.storageService.lastVisited('activityId') as number;
    this.lastVisitedActivityId = id;
    this.cdr.detectChanges();

    if (this.activities && this.isElementVisible(this.activities.nativeElement) && id !== null && this.milestones?.length > 0) {
      this.scrollToElement(id);
    }
  }

  ngOnInit() {
    const role = this.storageService.getUser().role;
    this.isParticipant = role === 'participant';
    this.pulseCheckIndicatorEnabled = this.storageService.getFeature('pulseCheckIndicator');
    this.isMobile = this.utils.isMobile();
    this.homeService.milestones$
      .pipe(
        distinctUntilChanged(),
        filter((milestones) => milestones !== null),
        takeUntil(this.unsubscribe$),
      ).subscribe(
        (milestones) => {
          this.milestones = milestones;
        }
      );

    this.achievementService.achievements$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.achievements = res;
      });

    this.homeService.experienceProgress$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.experienceProgress = res;
      });

    this.homeService.projectProgress$
      .pipe(
        filter((progress) => progress !== null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((progress) => {
        progress?.milestones?.forEach((m) => {
          m.activities?.forEach(
            (a) => (this.activityProgresses[a.id] = a.progress)
          );
        });
      });

    this.router.events
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateDashboard();
        }
      });

    this.unlockIndicatorService.unlockedTasks$
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: (unlockedTasks) => {
          this.hasUnlockedTasks = {}; // reset
          unlockedTasks.forEach((task) => {
            if (task.milestoneId) {
              if (this.unlockIndicatorService.isMilestoneClearable(task.milestoneId)) {
                this.verifyUnlockedMilestoneValidity(task.milestoneId);
              }
            }

            if (task.activityId) {
              this.hasUnlockedTasks[task.activityId] = true;
            }
          });
        },
      });

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  openPulseCheck() {
    this.fastFeedbackService.pullFastFeedback({
      closable: true,
      skipChecking: true,
      type: 'skills'
    }).pipe(first()).subscribe();
  }

  async updateDashboard() {
    await this.sharedService.refreshJWT(); // refresh JWT token [CORE-6083]
    this.experience = this.storageService.get("experience");
    this.homeService.getMilestones();
    this.achievementService.getAchievements();
    this.homeService.getProjectProgress();

    this.getIsPointsConfigured = this.achievementService.getIsPointsConfigured();
    this.getEarnedPoints = this.achievementService.getEarnedPoints();

    if (this.pulseCheckIndicatorEnabled === true) {
      this.homeService.getPulseCheckStatuses().pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe((res) => {
        this.pulseCheckStatus = res?.data?.pulseCheckStatus || {};
      });
    }

    this.utils.setPageTitle(this.experience?.name || 'Practera');
    this.defaultLeadImage = this.experience.cardUrl || '';

    // reset & load bookmarks
    this.bookmarkedActivities = {};
    const bookmarks = this.storageService.lastVisited('homeBookmarks') as number[] || [];
    bookmarks.forEach((id) => {
      this.bookmarkedActivities[id] = true;
    });

    this.fastFeedbackService.pullFastFeedback().pipe(
      first(),
      takeUntil(this.unsubscribe$),
    ).subscribe();

    this.homeService.getPulseCheckSkills().pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe((res) => {
      const newSkills = res?.data?.pulseCheckSkills || [];
      if (newSkills.length > 0) {
        this.pulseCheckSkills = newSkills;
      }
    });
  }

  goBack() {
    this.router.navigate(["experiences"]);
  }

  switchContent(event) {
    // update points upon switching to badges tab
    if (event.detail.value === "badges") {
      this.getIsPointsConfigured = this.achievementService.isPointsConfigured;
      this.getEarnedPoints = this.achievementService.earnedPoints;
    }
    this.display = event.detail.value;
  }

  endingIcon(activity) {
    if (activity.isLocked) {
      return "lock-closed";
    }
    const progress = this.activityProgresses[activity.id];
    if (!progress) {
      return "chevron-forward";
    }
    if (progress === 1) {
      return "checkmark-circle";
    }
    return null;
  }

  endingIconColor(activity) {
    const progress = this.activityProgresses[activity.id];
    if (!progress || activity.isLocked) {
      return "medium";
    }
    if (progress === 1) {
      return "success";
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
    // UI: clear lastVisited indicator (italic + grayed background)
    this.activityCol.el.querySelectorAll('.lastVisited').forEach((ele) => {
      ele.classList.remove('lastVisited');
    });

    if (
      keyboardEvent &&
      (keyboardEvent?.code === "Space" || keyboardEvent?.code === "Enter")
    ) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }

    // show guideline if locked
    if (activity.isLocked) {
      return this.showGuideline(activity, 'activity');
    }

    if (this.unlockIndicatorService.isActivityClearable(activity.id)) {
      const clearedActivityTodo = this.unlockIndicatorService.clearActivity(
        activity.id
      );
      clearedActivityTodo?.forEach((todo) => {
        this.notification
          .markTodoItemAsDone(todo)
          .pipe(first())
          .subscribe(() => {
            // eslint-disable-next-line no-console
            console.log("Marked activity as done", todo);
          });
      });
    }

    if (this.unlockIndicatorService.isMilestoneClearable(milestone.id)) {
      this.verifyUnlockedMilestoneValidity(milestone.id);
    }

    if (!this.isMobile) {
      return this.router.navigate(["v3", "activity-desktop", activity.id]);
    }

    return this.router.navigate(["v3", "activity-mobile", activity.id]);
  }

  /**
   * clear visited milestone unlock indicators
   * @param   {number}  milestoneId
   * @return  {void}
   */
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
          console.log("Marked milestone as done", unlockedMilestone);
        });
    });
  }

  async onTrackInfo() {
    const alert = await this.alertController.create({
      header: 'Traffic Light System',
      message: `This traffic light system helps visualise your project's progress:\n\n` +
        `• <span class='txt-green'>Green</span>: Project is flowing smoothly and meeting expectations - great work!\n` +
        `• <span class='txt-orange'>Orange</span>: Different perspectives exist that create an opportunity for valuable team discussion\n` +
        `• <span class='txt-red'>Red</span>: The project appears to be facing challenges that need attention - a perfect time to bring the team together to realign and find solutions\n\n` +
        `Remember, identifying when adjustments are needed is a strength that leads to better outcomes!`,
      buttons: ['OK'],
      cssClass: ['team-check-in-alert', 'wide-alert']
    });

    await alert.present();
  }

  async showGlobalSkillsInfo() {
    const alert = await this.alertController.create({
      header: 'Global Skills Assessment',
      message: `You'll regularly complete self-assessments of your Global Skills throughout this program. These assessments help you identify key areas for growth and development, while tracking your progress along the way. The Skills Strength section helps visualise your progress, making it easier to see your development over time. For detailed guidance on completing these assessments, refer to the 'How to Self-Assess Your Global Skills' topic.`,
      buttons: ['OK'],
      cssClass: ['team-check-in-alert', 'wide-alert']
    });

    await alert.present();
  }

  achievePopup(achievement: Achievement, keyboardEvent?: KeyboardEvent): void {
    if (
      keyboardEvent &&
      (keyboardEvent?.code === "Space" || keyboardEvent?.code === "Enter")
    ) {
      keyboardEvent.preventDefault();
    } else if (keyboardEvent) {
      return;
    }
    this.notification.achievementPopUp("", achievement);
  }

  scrollToElement(id: number): void {
    const activitiesEle = this.activities.nativeElement;
    const element = activitiesEle.querySelector(`#act-${id}`);

    if (activitiesEle && this.isElementVisible(element) && element?.scrollIntoView) {
      element.scrollIntoView({ behavior: 'auto', block: 'center' });
      element.classList.add('lastVisited');
      this.storageService.lastVisited('activityId', null);
    }
  }

  // make sure the element is visible in viewport
  private isElementVisible(element: HTMLElement): boolean {
    try {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetHeight > 0;
    } catch (e) {
      console.error(e);
      if (isDevMode()) {
        this.storageService.append('errors', e);
      }
    }
  }

  // generate aria-label for skill dot
  // each circle announces its state
  // eg. "Level X achieved", "Level X half achieved", "Level X not achieved"
  getSkillDotAriaLabel(level: number, skillValue: number): string {
    if (level <= Math.floor(skillValue)) {
      return `Level ${level} achieved`;
    } else if (level === Math.floor(skillValue) + 1 && skillValue % 1 === 0.5) {
      return `Level ${level} half achieved`;
    } else {
      return `Level ${level} not achieved`;
    }
  }

  /**
   * Get formatted percentage change string with appropriate styling
   * @param skillId - The ID of the skill
   * @param currentValue - Current skill value
   * @param changeValue - Change value from API
   * @returns Object with change text and CSS class
   */
  getSkillChangeDisplay(skillId: number, currentValue: number, changeValue?: number): { text: string; cssClass: string } | null {
    // Use change value from API if available
    if (changeValue !== undefined) {
      return this.pulsecheckService.getSkillChangeDisplayFromValue(changeValue);
    }
    // Return null if no change value provided
    return null;
  }

  // show unlock guideline for locked milestone or activity
  async showGuideline(item: Milestone | Activity, type: 'milestone' | 'activity' = 'milestone') {

    let message = '';

    const routes = [];
    const guidelines = item.unlockConditions;

    if (!guidelines) {
      return;
    }

    if (guidelines.length === 0) {
      return;
    } else if (guidelines.length >= 1) {
      message += `Please follow the steps below to unlock this ${type}:`;

      guidelines.forEach((guideline, index) => {
        if (guideline.meta) {
          const { activityId, assessmentId, topicId, contextId } = guideline.meta;

          const action = this.utils.ucfirst(guideline.action);
          const isMobile = this.utils.isMobile();
          if (topicId) {
            routes.push({
              path: isMobile
                ? `/v3/topic-mobile/${activityId}/${topicId}`
                : `/v3/activity-desktop/${activityId}/${topicId}`,
              label: `<i><b>${action}</b></i> ${guideline.name}`,
            });
          } else if (assessmentId) {
            routes.push({
              path: isMobile
                ? `/v3/assessment-mobile/${contextId}/${activityId}/${assessmentId}`
                : `/v3/activity-desktop/${contextId}/${activityId}/${assessmentId}`,
              label: `<i><b>${action}</b></i> ${guideline.name}`,
            });
          }
        }
      });
    }

    await this.notification.popUp(
      "guidelines",
      {
        logo: 'lock-open',
        message,
        routes,
      },
    );
  }
}
