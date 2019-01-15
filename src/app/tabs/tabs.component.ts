import { Component } from '@angular/core';
import { TabsService } from './tabs.service';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
import { SwitcherService } from '../switcher/switcher.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})

export class TabsComponent extends RouterEnter {
  routeUrl: string = '/app/';
	showReview = false;
  showChat = true;
  noOfTodoItems = 0;
  noOfChats = 0;
  selectedTab = '';

  constructor (
    public router: Router,
    private tabsService: TabsService,
    private storage: BrowserStorageService,
    private switcherService: SwitcherService
  ) {
    super(router);
  }

  onEnter() {
    this._checkRoute();
    this.tabsService.getNoOfTodoItems()
      .subscribe(noOfTodoItems => {
        this.noOfTodoItems = noOfTodoItems;
      });
    // only get the number of chats if user is in team
    if (this.storage.getUser().teamId) {
      this.tabsService.getNoOfChats()
        .subscribe(noOfChats => {
          this.noOfChats = noOfChats;
        });
    }
    this.switcherService.getTeamInfo().subscribe(data => {
      if (!this.storage.getUser().teamId) {
        this.showChat = false;
      }
    });
  }

  private _checkRoute() {
    switch (this.router.url) {
      case "/app/home":
        this.selectedTab = 'home';
        break;

      case "/app/project":
        this.selectedTab = 'project';
        break;

      case "/app/settings":
        this.selectedTab = 'settings';
        break;

      case "/app/chat":
        this.selectedTab = 'chat';
        break;

      default:
        if (this.router.url.includes('/app/activity')) {
          this.selectedTab = 'project';
        } else if (this.router.url.includes('/app/reviews')) {
          this.selectedTab = 'reviews';
        } else {
          this.selectedTab = ''
        }
        break;
    }
  }
}
