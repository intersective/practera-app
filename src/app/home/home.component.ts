import { Component } from "@angular/core";
import { HomeService, TodoItem } from "./home.service";
import { Router, NavigationEnd } from "@angular/router";
import { FastFeedbackService } from "../fast-feedback/fast-feedback.service";
import { Activity } from "../project/project.service";
import { UtilsService } from "@services/utils.service";
import { Subscription } from "rxjs";
import { BrowserStorageService } from "@services/storage.service";
import { RouterEnter } from "@services/router-enter.service";
import { PusherService } from "@shared/pusher/pusher.service";

@Component({
  selector: "app-home",
  templateUrl: "home.component.html",
  styleUrls: ["home.component.scss"]
})
export class HomeComponent extends RouterEnter {
  routeUrl: string = "/app/home";
  progress: number = 0;
  loadingProgress: boolean = true;
  programName: string;
  todoItems: Array<TodoItem> = [];
  loadingTodoItems: boolean = true;
  activity: Activity;
  loadingActivity: boolean = true;
  subscriptions: Subscription[] = [];

  constructor(
    public router: Router,
    private homeService: HomeService,
    private fastFeedbackService: FastFeedbackService,
    public utils: UtilsService,
    public storage: BrowserStorageService,
  ) {
    super(router);
    let role = this.storage.getUser().role;
    this.utils.getEvent("notification").subscribe(event => {
      let todoItem = this.homeService.getTodoItemFromEvent(event);
      if (!this.utils.isEmpty(todoItem)) {
        // add todo item to the list if it is not empty
        this.todoItems.push(todoItem);
      }
    });
    this.utils.getEvent("team-message").subscribe(event => {
      this.homeService.getChatMessage().subscribe(chatMessage => {
        if (!this.utils.isEmpty(chatMessage)) {
          this._addChatTodoItem(chatMessage);
        }
      });
    });
    if (role !== "mentor") {
      this.utils.getEvent("team-no-mentor-message").subscribe(event => {
        this.homeService.getChatMessage().subscribe(chatMessage => {
          if (!this.utils.isEmpty(chatMessage)) {
            this._addChatTodoItem(chatMessage);
          }
        });
      });
    }
  }

  private _initialise() {
    this.todoItems = [];
    this.loadingTodoItems = true;
    this.loadingProgress = true;
    this.loadingActivity = true;
  }

  onEnter() {
    this._initialise();
    this.subscriptions.push(
      this.homeService.getTodoItems().subscribe(todoItems => {
        this.todoItems = this.todoItems.concat(todoItems);
        this.loadingTodoItems = false;
      })
    );
    // only get the number of chats if user is in team
    if (this.storage.getUser().teamId) {
      this.subscriptions.push(
        this.homeService.getChatMessage().subscribe(chatMessage => {
          if (!this.utils.isEmpty(chatMessage)) {
            this._addChatTodoItem(chatMessage);
          }
          this.loadingTodoItems = false;
        })
      );
    }
    this.subscriptions.push(
      this.homeService.getProgress().subscribe(progress => {
        this.progress = progress;
        this.loadingProgress = false;
        this.homeService.getCurrentActivity().subscribe(activity => {
          if (activity.id) {
            this.activity = activity;
            this.loadingActivity = false;
          }
        });
      })
    );
    this.homeService.getProgramName().subscribe(programName => {
      this.programName = programName;
    });
    this.subscriptions.push(
      this.fastFeedbackService.getFastFeedback().subscribe(res => {
        // popup instant feedback view if question quantity found > 0
        if (!this.utils.isEmpty(res.data) && res.data.slider.length > 0) {
          return this.homeService.popUpFastFeedback({
            questions: res.data.slider,
            meta: res.data.meta
          });
        }
      })
    );
  }

  goToActivity(id) {
    this.router.navigateByUrl("app/activity/" + id);
  }

  goToAssessment(activityId, contextId, assessmentId) {
    this.router.navigate([
      "assessment",
      "assessment",
      activityId,
      contextId,
      assessmentId
    ]);
  }

  goToReview(contextId, assessmentId, submissionId) {
    this.router.navigate([
      "assessment",
      "review",
      contextId,
      assessmentId,
      submissionId
    ]);
  }

  goToChat() {
    this.router.navigateByUrl("app/chat");
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private _addChatTodoItem(chatTodoItem) {
    let currentChatTodoIndex = -1;
    let currentChatTodo = this.todoItems.find((todoItem, index) => {
      if (todoItem.type === 'chat') {
        currentChatTodoIndex = index;
        return true;
      }
    });
    if (currentChatTodo) {
      this.todoItems.splice(currentChatTodoIndex, 1);
    }
    this.todoItems.push(chatTodoItem);
  }

}
