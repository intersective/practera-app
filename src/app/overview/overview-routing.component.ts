import { Component, OnInit } from '@angular/core';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';

@Component({
  selector: 'app-overview-routing',
  templateUrl: './overview-routing.component.html',
  styleUrls: ['./overview-routing.component.scss']
})
export class OverviewRoutingComponent implements OnInit {
  isMobile: boolean;
  programName: string;

  constructor(
    private storage: BrowserStorageService,
    private utils: UtilsService,
  ) {
    this.isMobile = this.utils.isMobile();
    console.log('this.isMobile::', this.isMobile);
  }

  ngOnInit() {
    this.programName = this.storage.getUser().programName;
  }
}
