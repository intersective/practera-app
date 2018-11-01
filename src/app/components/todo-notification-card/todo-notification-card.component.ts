import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-todo-notification-card',
  templateUrl: './todo-notification-card.component.html',
  styleUrls: ['./todo-notification-card.component.scss']
})
export class TodoNotificationCardComponent implements OnInit {
   
  role: string = '';
  constructor() {};
  
  @Input() notification: {};
  
  ngOnInit() {
  }

}
