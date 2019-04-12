import { Component, OnInit, Input } from '@angular/core';
import { TodoItem } from '../home.service';

@Component({
  selector: 'app-todo-card',
  templateUrl: './todo-card.component.html',
  styleUrls: ['./todo-card.component.scss']
})
export class TodoCardComponent implements OnInit {
  @Input() loading: boolean;
  @Input() todoItem: TodoItem;

  constructor() {}

  ngOnInit() {
  }

}
