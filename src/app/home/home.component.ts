import { Component } from '@angular/core';
import { TodoService } from '../services/todo/todo.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent {
  public todo:boolean  = true;
  public progress:number = 80;
  Program = {
    Name : 'Demo program'
  };
  notifications= [];
   
  constructor ( public todoList: TodoService ) {
    this.notifications = todoList.todo;
    this.todo = (todoList.todo.length? true : false)   
  };
  
}
