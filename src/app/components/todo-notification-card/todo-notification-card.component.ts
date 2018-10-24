import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-todo-notification-card',
  templateUrl: './todo-notification-card.component.html',
  styleUrls: ['./todo-notification-card.component.scss']
})
export class TodoNotificationCardComponent implements OnInit {
  Team = {
    name :'team 1'
  }
  Assessment = {
    name: 'name1'
  };
  todo ='';
  
  constructor() { 
  }

  ngOnInit() {
  }

}
