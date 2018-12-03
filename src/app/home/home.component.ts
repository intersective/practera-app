import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  progress:number = 80;
  programName:string;
  todoItems = [];
  activity = {};
  
  constructor (
    private router: Router,
    private homeService: HomeService 
  ) {}

  ngOnInit() {
    this.todoItems = this.homeService.getTodoItems();
    this.activity = this.homeService.getCurrentActivity();
    this.homeService.getProgramName()
      .subscribe(programName => {
        this.programName = programName;
      });
  };

  activityRedirection(id) {
    this.router.navigateByUrl('app/(project:activity/' + id + ')');
  }
  
}
