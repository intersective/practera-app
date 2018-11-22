import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { Location } from  '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ProjectService } from './project.service';


@Component({
  selector: 'app-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss']
})
export class ProjectComponent implements OnInit{
  @ViewChild("milestones") milstones: ElementRef<any>;

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private location: Location ) {};

    public milestonesHeigth = [];
    public levels = [];
    
  ngOnInit() {
    // this.id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.projectService.getMilestons()
      .subscribe(levels => this.levels = levels);
      
  }
  goto(id) {
    console.log ('activity.id is:', id);
  }
  trackLevel(index,level){
    //do what ever logic you need to come up with the unique identifier of your item in loop, I will just return the object id.
    return level.id ? level.id : undefined;
   }
  
  scroll(ev) {
    var scrollTopCurrent = ev.detail.scrollTop;
    var scrollTopMax = ev.detail.event.path[0].clientHeight;
    var scrollBottom = scrollTopMax - scrollTopCurrent;

    console.log(ev.detail);
    console.log('scrollTopCurrent', scrollTopCurrent);
    console.log('scrollTopMax', scrollTopMax);
    console.log('scrollBottom', scrollBottom);
    
  }
  scrollTo (level) {
    console.log('go to milestone-id',level.id);
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
