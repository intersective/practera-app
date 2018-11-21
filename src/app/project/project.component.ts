import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef  } from '@angular/core';
import { Location } from  '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MilestoneService } from './project.service';
import { Content } from '@ionic/angular';


@Component({
  selector: 'app-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss']
})
export class ProjectComponent implements OnInit{
  @ViewChild("milestones") milstones: ElementRef<any>;

  constructor(
    location: Location,
    private router: Router,
    private milestoneService: MilestoneService) {};

  location: Location;
  public activeMileStoneId = '';
  public milestonesHeigth = [];

  
  public levels = [];
    
  ngOnInit() {
    // this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.milestoneService.getMilestons()
      .subscribe(levels => this.levels = levels);
      
  }
  goto(id) {
    console.log ('activity.id is:', id);
  }
  activityRedirection(id) {
    this.router.navigate(['pages', 'tabs', { outlets: { activity: ['activity', id] } }]);
  }

  scroll(ev) {
    var scrollTopCurrent = ev.detail.scrollTop;
    var scrollTopMax = ev.detail.event.path[0].clientHeight;
    var scrollBottom = scrollTopMax - scrollTopCurrent;

    console.log(ev.detail);
    console.log('scrollTopCurrent', scrollTopCurrent);
    console.log('scrollTopMax', scrollTopMax);
    console.log('scrollBottom', scrollBottom);
    // for (let i=0; i< this.milestonesHeigth.length; i++ ) {
    //   console.log();
    // }
    
   }
   
   ngAfterViewChecked() {
    let elementRef = this.milstones;
    let length = elementRef.nativeElement.children.length;
    
    
    if (elementRef) {
      for (let i=0; i< length; i++) {
        this.milestonesHeigth[i] = this.milstones.nativeElement.children[i].clientHeight;
      } 
    }
  }
   
}
