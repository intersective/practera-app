import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService, Milestone } from './project.service';
import { HomeService } from '../home/home.service';

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
export class ProjectComponent {

  public programName:string;

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private homeService: HomeService
   ) {}

  public milestones: Array<Milestone> = [];
  public loadingActivity: boolean = true;
  public loadingMilestone: boolean = true;
  public loadingProgress: boolean = true;

  ionViewDidEnter() {
    this.homeService.getProgramName().subscribe(programName => {
      this.programName = programName;
    });

    this.projectService.getMilestones()
      .subscribe(milestones => {
        this.milestones = milestones;
        this.loadingMilestone = false;
        this.projectService.getActivities(milestones)
          .subscribe(activities => {
            this.milestones = this._addActivitiesToEachMilestone(this.milestones, activities);
            this.loadingActivity = false;
            this.projectService.getProgress(this.milestones).subscribe(progresses => {
              this.milestones = this._populateMilestoneProgress(progresses, this.milestones);
              this.loadingProgress = false;
            });
          });
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
        })
        milestones[milestoneIndex].Activity[activityIndex].progress = thisActivity.progress;
      });
    });
    return milestones;
  }
}
