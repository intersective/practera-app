import { Component, OnInit } from '@angular/core';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-overview-routing',
  templateUrl: './overview-routing.component.html'
})
export class OverviewRoutingComponent implements OnInit {

  programName: string;
  constructor(private storage: BrowserStorageService) { }

  ngOnInit() {
    this.programName = this.storage.getUser().programName;
  }
}
