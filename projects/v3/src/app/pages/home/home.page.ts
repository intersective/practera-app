import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeService } from '@v3/services/home.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  experience$ = this.service.experience$;
  experienceProgress$ = this.service.experienceProgress$;
  milestones$ = this.service.milestonesWithProgress$;

  constructor(
    private route: ActivatedRoute,
    private service: HomeService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.service.getExperience();
      this.service.getMilestones();
      this.service.getProjectProgress();
    });
  }

  get isMobile() {
    return this.utils.isMobile();
  }

}
