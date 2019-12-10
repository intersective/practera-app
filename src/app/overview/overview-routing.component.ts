import { Component, OnInit } from '@angular/core';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { combineLatest, Observable, of } from 'rxjs';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';

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
    private fastFeedbackService: FastFeedbackService,
  ) {
    this.isMobile = this.utils.isMobile();
  }

  ngOnInit() {
    this.programName = this.storage.getUser().programName;
  }

  onEnter() {
    this.fastFeedbackService.pullFastFeedback().subscribe();
  }
}
