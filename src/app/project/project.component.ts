import { Component, HostListener, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService, Milestone } from './project.service';
import { HomeService } from '../home/home.service';
import { RouterEnter } from '@services/router-enter.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';

export interface Activity {
  id: number;
  name: string;
  milestoneId?: number;
  isLocked: boolean;
  leadImage?: string;
  progress?: number;
}
export interface Milestone {
  id: number;
  name: string;
  description?: string;
  isLocked: boolean;
  progress: number;
  Activity: Array <Activity>;
}

@Component({
  selector: 'app-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss']
})
export class ProjectComponent extends RouterEnter {

  public routeUrl: string = '/app/project';
  public programName: string;
  public milestones: Array<Milestone> = [];
  public loadingActivity: boolean = true;
  public loadingMilestone: boolean = true;
  public loadingProgress: boolean = true;
  @ViewChild('contentRef', {read: ElementRef}) contentRef: any;
  @ViewChildren('milestoneRef', {read: ElementRef}) milestoneRefs: QueryList<ElementRef>;
  private milestonePositions: Array<number> = [];
  public activeMilestone: Array<boolean> = [];

  constructor(
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
    private projectService: ProjectService,
    private homeService: HomeService,
   ) {
    super(router);
  }

  private _initialise() {
    this.milestones = [];
    this.loadingActivity = true;
    this.loadingMilestone = true;
    this.loadingProgress = true;
  }

  onEnter() {
    this._initialise();
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
            this.milestones = this._addActivitiesToEachMilestone(this.milestones, activities);
            this.loadingActivity = false;
            this.projectService.getProgress(this.milestones).subscribe(progresses => {
              this._getMilestonePositions();
              this.milestones = this._populateMilestoneProgress(progresses, this.milestones);
              this.loadingProgress = false;
            });
          });
      });
  }

  trackScrolling(event) {
    let activeMilestoneIndex = this.milestonePositions.findIndex((element, i) => {
      if (i == this.milestonePositions.length - 1) {
        return event.detail.currentY >= element;
      }
      return event.detail.currentY >= element && event.detail.currentY < this.milestonePositions[i + 1];
    });
    // update active milestone status
    this.activeMilestone.fill(false);
    this.activeMilestone[activeMilestoneIndex] = true;
  }

  // scroll to a milestone. i is the index of milestone list
  scrollTo(i) {
    this.contentRef.nativeElement.scrollToPoint(0, this.milestonePositions[i], 500);
  }

  private _getMilestonePositions() {
    this.milestonePositions = this.milestoneRefs.map(milestoneRef => {
      return milestoneRef.nativeElement.offsetTop;
    });
  }

  goToActivity(id) {
    this.router.navigate(['app', 'activity', id]);
  }

  private _addActivitiesToEachMilestone(milestones, activities) {
    activities.forEach(activity => {
      let milestoneIndex = milestones.findIndex(milestone => {
        return milestone.id === activity.milestoneId
      });
      milestones[milestoneIndex].Activity.push(activity);
    });
    return milestones;
  }

  private _populateMilestoneProgress(progresses, milestones) {
    progresses.Milestone.forEach(milestoneProgress => {
      let milestoneIndex = milestones.findIndex(milestone => {
        return milestone.id === milestoneProgress.id
      });

      milestones[milestoneIndex].progress = milestoneProgress.progress;
      milestones[milestoneIndex].Activity.forEach((activity, activityIndex) => {
        var thisActivity = milestoneProgress.Activity.find(item => {
          return item.id === activity.id;
        });
        if (this.utils.has(thisActivity, 'progress')) {
          milestones[milestoneIndex].Activity[activityIndex].progress = thisActivity.progress;
        } else {
          milestones[milestoneIndex].Activity[activityIndex].progress = 0;
        }
      });
    });
    return milestones;
  }
}
