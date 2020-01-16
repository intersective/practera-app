import { Component, OnInit } from '@angular/core';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  constructor(private newRelic: NewRelicService) {}

  ngOnInit() {
    this.newRelic.setPageViewName('page-not-found');
  }
}
