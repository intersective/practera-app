import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-questions',
  template: '<ion-router-outlet></ion-router-outlet>'
})
export class QuestionsComponent implements OnInit {

  constructor (
  ) {}

  ngOnInit() {
  }


}
