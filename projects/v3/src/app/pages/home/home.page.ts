import { Component, OnInit } from '@angular/core';
import { HomeService } from '@v3/services/home.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  experience$ = this.homeService.experience$;

  constructor(
    private homeService: HomeService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.homeService.getExperience();
  }

  get isMobile() {
    return this.utils.isMobile();
  }

}
