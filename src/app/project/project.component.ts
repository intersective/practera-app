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
  public activities: Array<Activity> = [];
  
    
  ngOnInit() {
    this.projectService.getMilestones()
      .subscribe(milestones => {
        this.milestones = milestones;
        this.loadingMilestone = false;
      });
    this.milestonesIds = this.projectService.getMilestoneIds(this.milestones);
    this.projectService.getActivities(this.milestonesIds)
      .subscribe(activities => { 
        this.activities = activities;
        this.projectService.addActivitiesToEachMilestone(this.milestones, this.activities)
        .subscribe(milestones => {
          this.loadingActivity = false;
          this.milestones = milestones;
        });
    this.projectService.getProgress(this.milestones).subscribe();
      })
    }

    goToActivity(id) {
      this.router.navigateByUrl('app/(project:activity/' + id + ')');
    }
  }