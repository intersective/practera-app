import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService, Milestone } from './project.service';

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
export class ProjectComponent implements OnInit{

public programName:string = "Demo Program";
  constructor(
    private router: Router,
    private projectService: ProjectService
   ) {};

  public milestones: Array <Milestone> = [] ;
  public milestonesIds: Array<number> =[];
  public loadingActivity: boolean = true;
  public loadingMilestone: boolean = true;
  public loadingProgress: boolean = true;
  public activities: Array<Activity> = [];
  public progress: number = 0;
  
    
  ngOnInit() {
    this.projectService.getMilestones()
      .subscribe(milestones => {
        this.milestones = milestones;
        this.loadingMilestone = false;
        this.milestonesIds = this.projectService.getMilestoneIds(this.milestones);
        this.projectService.getActivities(this.milestonesIds)
          .subscribe(activities => { 
            this.activities = activities;
            this.milestones = this.addActivitiesToEachMilestone(this.milestones, this.activities);
            this.loadingActivity = false;
            this.projectService.getProgress(this.milestones).subscribe(
              progress => {
                this.progress = progress;
                this.milestoneProgress(progress,this.milestones);
                this.loadingProgress = false;
              }
            );
          });
      });
  }

  goToActivity(id) {
    this.router.navigateByUrl('app/(project:activity/' + id + ')');
  }

  addActivitiesToEachMilestone(milestones,activities) {
    let findMilestone: Milestone = {
      id: 0,
      name: '',
      description: '',
      isLocked: false,
      progress: 0,
      Activity:[]
    };
    activities.forEach(function (activity) {
      findMilestone = milestones.find(function (milestonWithThisId) {
        return milestonWithThisId.id === activity.milestoneId
      })
      findMilestone.Activity.push(activity);
    });
  
    return milestones;
  }

  milestoneProgress(progress,milestones) {
    
    progress.Milestone.forEach(function(eachMilestone){ 
      let findMilestone = milestones.find(function (milestone) {
       return milestone.id === eachMilestone.id
      });

    findMilestone.progress = eachMilestone.progress;
    findMilestone.Activity.forEach(function(activity){
      var findActivityWithThisId = eachMilestone.Activity.find(function(item) {
        return item.id === activity.id;
      })
      activity.progress = findActivityWithThisId.progress;
      });
    })
  }
    
  }