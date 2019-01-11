import { Component, OnInit } from '@angular/core';
import { HomeService, TodoItem } from './home.service';
import { Router, NavigationEnd } from '@angular/router';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { Activity } from '../project/project.service';
import { UtilsService } from '@services/utils.service';
import { Subscription } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';

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
  subscriptions: Subscription[] = [];
  subscription: Subscription;

  constructor (
    private router: Router,
    private homeService: HomeService,
    private fastFeedbackService: FastFeedbackService,
    private utils: UtilsService,
    private storage: BrowserStorageService
  ) {}

  ngOnInit() {
    this.onEnter();
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url == 'app/home') {
        this.onEnter()
      }
    });
  }

  private _initialisation() {
    // initialise todoItems array
    this.todoItems = [];
    this.loadingTodoItems = true;
  }

  onEnter() {
    this._initialisation();
    this.subscriptions.push(
      this.homeService.getTodoItems()
        .subscribe(todoItems => {
          this.todoItems = this.todoItems.concat(todoItems);
          this.loadingTodoItems = false;
        })
    );
    // only get the number of chats if user is in team
    if (this.storage.getUser().teamId) {
      this.subscriptions.push(
        this.homeService.getChatMessage()
          .subscribe(chatMessage => {
            if (!this.utils.isEmpty(chatMessage)) {
              this.todoItems.push(chatMessage);
            }
            this.loadingTodoItems = false;
          })
      );
    }
    this.subscriptions.push(
      this.homeService.getProgress()
        .subscribe(progress => {
          this.progress = progress;
          this.loadingProgress = false;
          this.homeService.getCurrentActivity()
            .subscribe(activity => {
              if (activity.id) {
                this.activity = activity;
                this.loadingActivity = false;
              }
            });
        })
     );
    this.homeService.getProgramName()
      .subscribe(programName => {
        this.programName = programName;
      });
    this.subscriptions.push(
      this.fastFeedbackService.getFastFeedback()
        .subscribe(res => {
          // popup instant feedback view if question quantity found > 0
          if (res.data && res.data.length > 0) {
            return this.fastFeedbackService.popUp({
              questions: res.data,
            });
          }
        })
    );
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
    this.router.navigateByUrl('app/chat');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscription.unsubscribe();
  }
}
