import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  progress:number = 80;
  Program = {
    Name : 'Demo program'
  };
  todoItems = [];
  activity = {};
  
  constructor ( 
    private homeService: HomeService 
  ) {}

  ngOnInit() {
    this.todoItems = this.homeService.getTodoItems();
    this.activity = this.homeService.getCurrentActivity();  
  };
  
}
