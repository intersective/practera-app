import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  experience$ = this.homeService.experience$;

  constructor(
    private homeService: HomeService
  ) { }

  ngOnInit() {
    this.homeService.getExperience();
  }

}
