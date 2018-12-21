import { Component } from '@angular/core';
import { TabsService } from './tabs.service';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class TabsComponent {
	showReview = false;
  showChat = true;
  noOfTodoItems = 0;
  noOfChats = 0;

  constructor (
    private tabsService: TabsService,
    private storage: BrowserStorageService
  ) {}

  ionViewWillEnter() {
    this.tabsService.getNoOfTodoItems()
      .subscribe(noOfTodoItems => {
        this.noOfTodoItems = noOfTodoItems;
      });
    this.tabsService.getNoOfChats()
      .subscribe(noOfChats => {
        this.noOfChats = noOfChats;
      });
    if (!this.storage.getUser().teamId) {
      this.showChat = false;
    }
  }
}
