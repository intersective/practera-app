import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExperienceService } from '@v3/services/experience.service';
import { UtilsService } from '@v3/services/utils.service';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.page.html',
  styleUrls: ['./experiences.page.scss'],
})
export class ExperiencesPage implements OnInit {

  programs$ = this.service.programs$;

  constructor(
    private route: ActivatedRoute,
    private service: ExperienceService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    this.service.getPrograms();
  }

}
