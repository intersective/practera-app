import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.component.html',
  styleUrls: ['tabs.component.scss']
})
export class TabsComponent {
	showTeam = false;
	showReview = false;
  showChat = true;
  noOfTodoItems = 0;
  noOfChats = 0;
}
