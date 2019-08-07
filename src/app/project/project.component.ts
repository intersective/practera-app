import { Component, HostListener, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService, Milestone, DummyMilestone } from './project.service';
import { HomeService } from '../home/home.service';
import { RouterEnter } from '@services/router-enter.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { SharedService } from '@services/shared.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss'],
})
export class ProjectComponent extends RouterEnter {
  public routeUrl = '/app/project';
  public programName: string;
  public milestones: Array<Milestone | DummyMilestone> = [];
  public loadingActivity = true;
  public loadingMilestone = true;
  public loadingProgress = true;
  @ViewChild('contentRef', {read: ElementRef}) contentRef: any;
  @ViewChildren('milestoneRef', {read: ElementRef}) milestoneRefs: QueryList<ElementRef>;
  public activeMilestone: Array<boolean> = [];
  private milestonePositions: Array<number> = [];
  private highlightedActivityId: number;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public utils: UtilsService,
    public storage: BrowserStorageService,
    private projectService: ProjectService,
    private homeService: HomeService,
    private sharedService: SharedService,
    public fastFeedbackService: FastFeedbackService
   ) {
    super(router);
  }

  private _initialise() {
    this.milestones = [{ dummy: true }];
    this.loadingActivity = true;
    this.loadingMilestone = true;
    this.loadingProgress = true;
  }

  onEnter() {
    this._initialise();
    this.route.queryParamMap.subscribe(params => {
      this.highlightedActivityId = +params.get('activityId') || undefined;
    });
    this.homeService.getProgramName().subscribe(programName => {
      this.programName = programName;
    });

    this.projectService.getMilestones()
      .subscribe(milestones => {

        this.milestones = milestones;
        this.loadingMilestone = false;
        this.activeMilestone = new Array(milestones.length);
        this.activeMilestone.fill(false);
        this.activeMilestone[0] = true;
        this.projectService.getActivities(milestones)
          .subscribe(activities => {
            // remove entire Activity object with dummy data for clean Activity injection
            if (this.milestones) {
              this.milestones.forEach((milestone, i) => {
                if (this.utils.find(this.milestones[i].Activity, {dummy: true})) {
                  this.milestones[i].Activity = [];
                }
              });
            }

            this.milestones = this._addActivitiesToEachMilestone(this.milestones, activities);
            this.loadingActivity = false;

            this.projectService.getProgress(this.milestones).subscribe(progresses => {
              this.milestonePositions = this.milestoneRefs.map(milestoneRef => {
                return milestoneRef.nativeElement.offsetTop;
              });

              this.milestones = this._populateMilestoneProgress(progresses, this.milestones);
              this.loadingProgress = false;

              if (this.highlightedActivityId) {
                this.scrollTo(`activity-card-${this.highlightedActivityId}`);
              }
            });
          });
      });

    this.fastFeedbackService.pullFastFeedback().subscribe();
  }

  trackScrolling(event) {
    const activeMilestoneIndex = this.milestonePositions.findIndex((element, i) => {
      const {
        detail, // current scrolling event
        srcElement // ion-content's height
      } = event;
      const screenMidPoint = detail.currentY + (srcElement.offsetHeight / 2);

      if (i === this.milestonePositions.length - 1) {
        return screenMidPoint >= element;
      }

      return screenMidPoint >= element && screenMidPoint < this.milestonePositions[i + 1];
    });

    // activeMilestoneIndex starts from -1
    if (this.activeMilestone[activeMilestoneIndex] !== true && activeMilestoneIndex !== -1) {
      this.activeMilestone.fill(false);
      this.activeMilestone[activeMilestoneIndex] = true;
    }
  }

  scrollTo(domId: string, index?: number): void {
    if (index) {
      this.activeMilestone[index] = true;
    }

    // update active milestone status (mark whatever user select)
    this.activeMilestone.fill(false);

    const el = document.getElementById(domId);
    el.scrollIntoView({ block: 'start', behavior: 'smooth', inline: 'nearest' });

    el.classList.add('highlighted');
    setTimeout(() => el.classList.remove('highlighted'), 1000);
  }

  goToActivity(id) {
    this.router.navigate(['app', 'activity', id]);
  }

  private _addActivitiesToEachMilestone(milestones, activities) {
    activities.forEach(activity => {
      const milestoneIndex = milestones.findIndex(milestone => {
        return milestone.id === activity.milestoneId;
      });
      milestones[milestoneIndex].Activity.push(activity);
    });
    return milestones;
  }

  private _populateMilestoneProgress(progresses, milestones) {
    progresses.Milestone.forEach(milestoneProgress => {
      const milestoneIndex = milestones.findIndex(milestone => {
        return milestone.id === milestoneProgress.id;
      });

      milestones[milestoneIndex].progress = milestoneProgress.progress;
      milestones[milestoneIndex].Activity.forEach((activity, activityIndex) => {
        const thisActivity = milestoneProgress.Activity.find(item => {
          return item.id === activity.id;
        });
        if (this.utils.has(thisActivity, 'progress')) {
          milestones[milestoneIndex].Activity[activityIndex].progress = thisActivity.progress;
        } else {
          milestones[milestoneIndex].Activity[activityIndex].progress = 0;
        }

        if (this.highlightedActivityId && activity.id === this.highlightedActivityId) {
          milestones[milestoneIndex].Activity[activityIndex].highlighted = true;
        }
      });
    });
    return milestones;
  }
}
