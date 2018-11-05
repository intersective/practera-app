import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.scss']
})
export class TodoCardComponent implements OnInit {
   
  role: string = '';
  constructor() {};
  
  @Input() notification: {};
  
  ngOnInit() {
  }

}
