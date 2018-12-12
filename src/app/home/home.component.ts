import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { Router } from '@angular/router';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  progress:number = 80;
  programName:string;
  todoItems = [];
  activity = {};
  questions:any[];

  constructor (
    private router: Router,
    private homeService: HomeService,
    private fastFeedbackService: FastFeedbackService,
  ) {}

  ngOnInit() {
    this.todoItems = this.homeService.getTodoItems();
    this.activity = this.homeService.getCurrentActivity();
    this.homeService.getProgramName()
      .subscribe(programName => {
        this.programName = programName;
      });
  };

  ionViewDidEnter() {
    this.fastFeedbackService.getInstantFeedback().subscribe(res => {
      console.log(res);
      // prepare ngModel for each of the data (question)
      res.data.forEach(datum => this.questions.push(datum));

      // popup instant feedback view if question quantity found > 0
      if (this.questions.length > 0) {        
        this.fastFeedbackService.popUp();
      }
    });
  }

  goToActivity(id) {
    this.router.navigateByUrl('app/(project:activity/' + id + ')');
  }
  
}
