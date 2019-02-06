import { Component } from "@angular/core";
import { TabsService } from "./tabs.service";
import { UtilsService } from "@services/utils.service";
import { BrowserStorageService } from "@services/storage.service";
import { RouterEnter } from "@services/router-enter.service";
import { SwitcherService } from "../switcher/switcher.service";
import { ReviewsService } from "../reviews/reviews.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-tabs",
  templateUrl: "tabs.component.html",
  styleUrls: ["tabs.component.scss"]
})
export class TabsComponent extends RouterEnter {
  routeUrl: string = "/app/";
  showReview = false;
  showChat = true;
  noOfTodoItems = 0;
  noOfChats = 0;
  selectedTab = "";

  constructor(
    public router: Router,
    private tabsService: TabsService,
    public storage: BrowserStorageService,
    public utils: UtilsService,
    private switcherService: SwitcherService,
    private reviewsService: ReviewsService,
  ) {
    super(router);
    let role = this.storage.getUser().role;
    this.utils.getEvent("notification").subscribe(event => {
      this.noOfTodoItems++;
    });
    this.utils.getEvent("team-message").subscribe(event => {
      this.tabsService.getNoOfChats().subscribe(noOfChats => {
        this.noOfChats = noOfChats;
      });
    });
    if (role !== "mentor") {
      this.utils.getEvent("team-no-mentor-message").subscribe(event => {
        this.tabsService.getNoOfChats().subscribe(noOfChats => {
          this.noOfChats = noOfChats;
        });
      });
    }
  }

  private _initialise() {
    this.showChat = true;
    this.showReview = false;
  }

  onEnter() {
    this._initialise();
    this._checkRoute();
    this.tabsService.getNoOfTodoItems().subscribe(noOfTodoItems => {
      this.noOfTodoItems = noOfTodoItems;
    });
    // only get the number of chats if user is in team
    if (this.storage.getUser().teamId) {
      this.tabsService.getNoOfChats().subscribe(noOfChats => {
        this.noOfChats = noOfChats;
      });
    }
    this.switcherService.getTeamInfo().subscribe(data => {
      if (this.storage.getUser().teamId) {
        this.showChat = true;
      } else {
        this.showChat = false;
      }
    });
    this.reviewsService.getReviews().subscribe(data => {
      if (data.length) {
        this.showReview = true;
      }
    });
  }

  private _checkRoute() {
    switch (this.router.url) {
      case "/app/home":
        this.selectedTab = "home";
        break;

      case "/app/project":
        this.selectedTab = "project";
        break;

      case "/app/settings":
        this.selectedTab = "settings";
        break;

      case "/app/chat":
        this.selectedTab = "chat";
        break;

      default:
        if (this.router.url.includes("/app/activity")) {
          this.selectedTab = "project";
        } else if (this.router.url.includes("/app/reviews")) {
          this.selectedTab = "reviews";
        } else {
          this.selectedTab = "";
        }
        break;
    }
  }
}
