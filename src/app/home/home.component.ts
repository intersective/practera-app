import { Component } from '@angular/core';

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
  notifications= [
    {
      AssessmentName :'demo assessmnet',
      TeamName: 'Team1',
      time : 'today'
    }
  ];
}
