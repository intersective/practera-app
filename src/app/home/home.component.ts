import { Component, OnInit } from '@angular/core';
import { HomeService, TodoItem } from './home.service';
import { Router } from '@angular/router';
import { Activity } from '../project/project.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  progress: number = 0;
  loadingProgress: boolean = true;
  programName: string;
  todoItems: Array<TodoItem> = [];
  loadingTodoItems: boolean = true;
  activity: Activity;
  loadingActivity: boolean = true;
  
  constructor (
    private router: Router,
    private homeService: HomeService 
  ) {}

  ngOnInit() {
    this.homeService.getTodoItems()
      .subscribe(todoItems => {
        // this.todoItems = this.todoItems.concat(todoItems);
        // this.loadingTodoItems = false;
      });
    this.homeService.getChatMessages()
      .subscribe(chatMessages => {
        // this.todoItems = this.todoItems.concat(chatMessages);
        // this.loadingTodoItems = false;
      });
    this.homeService.getProgress()
      .subscribe(progress => {
        // this.progress = progress;
        // this.loadingProgress = false;
        this.homeService.getCurrentActivity()
          .subscribe(activity => {
            // this.activity = activity;
            // this.loadingActivity = false;
          });
      });
    this.homeService.getProgramName()
      .subscribe(programName => {
        this.programName = programName;
      });
  };

  goToActivity(id) {
    this.router.navigateByUrl('app/(project:activity/' + id + ')');
  }

  goto(todoItem) {
    // this.router.navigateByUrl('assessment/review/'+ contextId +'/'+ id );
  }
}
