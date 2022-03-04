import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  experience$ = this.service.experience$;

  constructor(
    private service: HomeService
  ) { }

  ngOnInit() {
    this.service.getExperience();
  }

}
