import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService, Milestone } from './project.service';

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

  public milestons: Array <Milestone> ;
    
  ngOnInit() {
    this.projectService.getMilestons()
      .subscribe(milestones => this.milestons = milestones);
  }

  goToActivity(id) {
    this.router.navigateByUrl('app/(project:activity/' + id + ')');
  }

   
}
