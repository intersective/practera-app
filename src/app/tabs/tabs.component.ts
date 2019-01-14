import { Component } from '@angular/core';
import { TabsService } from './tabs.service';
import { BrowserStorageService } from '@services/storage.service';
import { RouterEnter } from '@services/router-enter.service';
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

  constructor (
    public router: Router,
    private tabsService: TabsService,
    private storage: BrowserStorageService
  ) {
    super(router);
  }

  onEnter() {
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
    if (!this.storage.getUser().teamId) {
      this.showChat = false;
    }
  }
}
