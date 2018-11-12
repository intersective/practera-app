import { Component, OnInit, EventEmitter, Output  } from '@angular/core';
import { Location } from  '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MilestoneService } from './project.service';

@Component({
  selector: 'app-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss']
})
export class ProjectComponent implements OnInit{

  constructor(
    location: Location,
    // private route: ActivatedRoute,
    private milestoneService: MilestoneService) {};

  location: Location;
  public activeMileStoneId = '';

  
  public levels = [];
    
  ngOnInit() {
    // this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.milestoneService.getMilestons()
      .subscribe(levels => this.levels = levels);
  }

}
