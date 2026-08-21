import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked, ElementRef, ChangeDetectorRef, isDevMode } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '@v3/environments/environment';
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
import { Observable, Subject, of } from 'rxjs';
import { distinctUntilChanged, filter, first, takeUntil, catchError } from 'rxjs/operators';
import { FastFeedbackService } from '@v3/app/services/fast-feedback.service';
import { AlertController, ModalController } from '@ionic/angular';
import { Activity } from '@v3/app/services/activity.service';
import { PulsecheckService } from '@v3/app/services/pulsecheck.service';
import { ProjectBriefModalComponent } from '@v3/app/components/project-brief-modal/project-brief-modal.component';
import { ProjectBrief } from '@v3/app/models/project-brief.model';

@Component({
  standalone: false,
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit, OnDestroy, AfterViewChecked {
  display = 'activities';

  activityCount$: Observable<number>;
  experienceProgress: number;
  pulseCheckStatus: TrafficLightGroupComponent["lights"];
  milestones: Milestone[] = null; // Initialize as null to differentiate between not loaded and empty
  achievements: Achievement[];
  experience: Experience;

  isMobile: boolean;
  isParticipant: boolean;
  isExpert: boolean;
  isExpertWithoutTeam: boolean;
  pulseCheckIndicatorEnabled: boolean;
  activityProgresses = {};

  getIsPointsConfigured: boolean = false;
  getEarnedPoints: number = 0;
  hasUnlockedTasks: Object = {};

  // default card image (gracefully show broken url)
  defaultLeadImage: string = "";

  lastVisitedActivityId?: number;
  bookmarkedActivities: {
    [key: number]: boolean;
  } = {};

  unsubscribe$ = new Subject();
  milestones$: Observable<Milestone[]>;

  @ViewChild('activityCol') activityCol: { el: HTMLIonColElement };
  @ViewChild('activities', { static: false }) activities!: ElementRef;
  pulseCheckSkills: PulseCheckSkill[] = [];

  // project brief data from team storage
  projectBrief: ProjectBrief | null = null;
  showProjectHub = false;

  // activity search/filter
  activitySearchText = '';
  filteredMilestones: Milestone[] | null = null;

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
    private modalController: ModalController,
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
    this.updateUserRoleState();
    this.pulseCheckIndicatorEnabled = this.storageService.getFeature('pulseCheckIndicator');
    this.isMobile = this.utils.isMobile();

    // subscribe to team changes broadcast from shared service
    this.sharedService.team$
      .pipe(
        filter(team => team !== null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        // re-evaluate role state when team changes
        this.updateUserRoleState();
      });

    this.homeService.milestones$
      .pipe(
        distinctUntilChanged(),
        filter((milestones) => milestones !== null),
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          console.error('Error loading milestones:', error);
          return of([]);
        })
      ).subscribe(
        (milestones) => {
          this.milestones = milestones;
          this.filterActivities(); // apply filter when load
        }
      );

    this.achievementService.achievements$
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          console.error('Error loading achievements:', error);
          return of([]);
        })
      )
      .subscribe((res) => {
        this.achievements = res;
      });

    this.homeService.experienceProgress$
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          console.error('Error loading experience progress:', error);
          return of(-1); // Use -1 to indicate error state
        })
      )
      .subscribe((res) => {
        this.experienceProgress = res;
      });

    this.homeService.projectProgress$
      .pipe(
        filter((progress) => progress !== null),
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          console.error('Error loading project progress:', error);
          return of(null);
        })
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
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          console.error('Error loading unlocked tasks:', error);
          return of([]);
        })
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

    // call updateDashboard on initial load to ensure fresh data
    this.updateDashboard();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }

  async updateDashboard() {
    await this.sharedService.refreshJWT(); // refresh JWT token [CORE-6083]

    // re-evaluate user role and team status after JWT refresh updates teamId
    this.updateUserRoleState();

    this.experience = this.storageService.get("experience");
    this.showProjectHub = this.storageService.getFeature('showProjectHub');
    this.homeService.getMilestones({ forceRefresh: true });
    this.achievementService.getAchievements();
    this.homeService.getProjectProgress();

    const user = this.storageService.getUser();

    // load project brief from user storage
    this.projectBrief = user.projectBrief || null;

    this.getIsPointsConfigured = this.achievementService.getIsPointsConfigured();
    this.getEarnedPoints = this.achievementService.getEarnedPoints();

    if (this.pulseCheckIndicatorEnabled === true) {
      this.homeService.getPulseCheckStatuses().pipe(
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          console.error('Error loading pulse check statuses:', error);
          return of({ data: { pulseCheckStatus: {} } });
        })
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
      catchError((error) => {
        console.error('Error loading fast feedback:', error);
        return of(null);
      })
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

  private updateUserRoleState(): void {
    const user = this.storageService.getUser() || {};
    const role = user.role;
    const teamId = user.teamId;

    this.isParticipant = role === 'participant';
    this.isExpert = role === 'mentor';
    this.isExpertWithoutTeam = this.isExpert && !teamId;
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
  async gotoActivity({ activity, milestone }, keyboardEvent?: Event) {
    // UI: clear lastVisited indicator (italic + grayed background)
    this.activityCol.el.querySelectorAll('.lastVisited').forEach((ele) => {
      ele.classList.remove('lastVisited');
    });

    if (
      keyboardEvent instanceof KeyboardEvent &&
      (keyboardEvent.code === "Space" || keyboardEvent.code === "Enter")
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

  /**
   * @name showProjectBrief
   * @description opens modal to display project brief details
   */
  async showProjectBrief(): Promise<void> {
    if (!this.projectBrief) {
      return;
    }

    const cssClass = this.isMobile
      ? ['project-brief-modal', 'modal-fullscreen']
      : 'project-brief-modal';

    const modal = await this.modalController.create({
      component: ProjectBriefModalComponent,
      componentProps: {
        projectBrief: this.projectBrief,
        allowPdfDownload: true,
      },
      cssClass
    });

    await modal.present();
  }

  /**
   * @name openProjectBriefExternal
   * @description opens project brief in external projecthub application with authentication token
   */
  openProjectBriefExternal(): void {
    const apikey = this.storageService.getUser().apikey;
    const url = `${environment.projecthub}login?token=${apikey}`;
    window.open(url, '_blank');
  }

  achievePopup(achievement: Achievement, keyboardEvent?: Event): void {
    if (
      keyboardEvent instanceof KeyboardEvent &&
      (keyboardEvent.code === "Space" || keyboardEvent.code === "Enter")
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

  /**
   * filter activities based on search text
   * searches through activity title and description
   */
  filterActivities(): void {
    if (!this.milestones) {
      this.filteredMilestones = null;
      return;
    }

    const searchText = this.activitySearchText.toLowerCase().trim();

    if (!searchText) {
      this.filteredMilestones = this.milestones;
      return;
    }

    // filter milestones and their activities
    this.filteredMilestones = this.milestones
      .map(milestone => {
        const filteredActivities = milestone.activities?.filter(activity => {
          const titleMatch = activity.name?.toLowerCase().includes(searchText);
          const descriptionMatch = activity.description?.toLowerCase().includes(searchText);
          return titleMatch || descriptionMatch;
        }) ?? [];

        // only include milestone if it has matching activities
        if (filteredActivities.length > 0) {
          return {
            ...milestone,
            activities: filteredActivities
          };
        }
        return null;
      })
      .filter(milestone => milestone !== null);
  }

  /**
   * clear search input and reset filter
   */
  clearSearch(): void {
    this.activitySearchText = '';
    this.filterActivities();
  }

  /**
   * get total count of filtered activities across all milestones
   */
  getFilteredActivityCount(): number {
    if (!this.filteredMilestones) {
      return 0;
    }
    return this.filteredMilestones.reduce((total, milestone) => {
      return total + (milestone.activities?.length || 0);
    }, 0);
  }
}
