import { Component, OnInit } from '@angular/core';
import { TabsService } from './tabs.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class TabsComponent implements OnInit {
	showReview = false;
  showChat = true;
  noOfTodoItems = 0;
  noOfChats = 0;

  constructor (
    private tabsService: TabsService,
    // private utils: UtilsService
  ) {}

  ngOnInit() {
    this.tabsService.getNoOfTodoItems()
      .subscribe(noOfTodoItems => {
        this.noOfTodoItems = noOfTodoItems;
      });
    this.tabsService.getNoOfChats()
      .subscribe(noOfChats => {
        this.noOfChats = noOfChats;
      });
  }
}
