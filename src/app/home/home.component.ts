import { Component, OnInit } from '@angular/core';
import { HomeService, TodoItem } from './home.service';
import { Router } from '@angular/router';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { Activity } from '../project/project.service';
import { UtilsService } from '@services/utils.service';
import { Subscription } from 'rxjs';

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
  questions:any[] = [];
  loadingActivity: boolean = true;
  subscriptions: Subscription[] = [];

  constructor (
    private router: Router,
    private homeService: HomeService,
    private fastFeedbackService: FastFeedbackService,
    private utils: UtilsService
  ) {}

  ngOnInit() {
    this.homeService.getTodoItems()
      .subscribe(todoItems => {
        this.todoItems = this.todoItems.concat(todoItems);
        this.loadingTodoItems = false;
      });
    this.homeService.getChatMessage()
      .subscribe(chatMessage => {
        if (!this.utils.isEmpty(chatMessage)) {
          this.todoItems.push(chatMessage);
        }
        this.loadingTodoItems = false;
      });
    this.homeService.getProgress()
      .subscribe(progress => {
        this.progress = progress;
        this.loadingProgress = false;
        this.homeService.getCurrentActivity()
          .subscribe(activity => {
            if (!this.utils.isEmpty(activity)) {
              this.activity = activity;
              this.loadingActivity = false;
            }
          });
      });
    this.homeService.getProgramName()
      .subscribe(programName => {
        this.programName = programName;
      });
  };

  ionViewDidEnter() {
    const fastFeedback = this.fastFeedbackService.getFastFeedback().subscribe(res => {
      // popup instant feedback view if question quantity found > 0
      if (res.data && res.data.length > 0) {
        return this.fastFeedbackService.popUp({
          questions: res.data,
        });
      }
    });
    this.subscriptions.push(fastFeedback);
  }

  goToActivity(id) {
    this.router.navigateByUrl('app/activity/' + id);
  }

  goToAssessment(activityId, contextId, assessmentId) {
    this.router.navigate(['assessment', 'assessment', activityId , contextId, assessmentId]);
  }

  goToReview(contextId, assessmentId) {
    this.router.navigate(['assessment', 'review', contextId, assessmentId]);
  }

  goToChat() {
    this.router.navigateByUrl('app/(chat:chat)');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
