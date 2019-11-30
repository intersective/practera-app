import { Component, OnInit } from '@angular/core';
import { BrowserStorageService } from '@services/storage.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  programName: string;
  constructor(private storage: BrowserStorageService) { }

  ngOnInit() {
    this.programName = this.storage.getUser().programName;
  }

}
