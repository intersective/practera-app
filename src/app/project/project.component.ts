import { Component, HostListener, ViewChild, ViewChildren, QueryList, ElementRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService, Milestone, DummyMilestone } from './project.service';
import { HomeService } from '../home/home.service';
import { RouterEnter } from '@services/router-enter.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { SharedService } from '@services/shared.service';
import { FastFeedbackService } from '../fast-feedback/fast-feedback.service';
import { Subscription } from 'rxjs';
import { NewRelicService } from '@shared/new-relic/new-relic.service';

@Component({
  selector: 'app-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss'],
})
export class ProjectComponent extends RouterEnter {
  public routeUrl = '/app/project';
  public programName: string;
  public milestones: Array<Milestone | DummyMilestone> = [];
  public loadingMilestone = true;
  @ViewChild('contentRef', {read: ElementRef}) contentRef: any;
  @ViewChildren('milestoneRef', {read: ElementRef}) milestoneRefs: QueryList<ElementRef>;
  // the milestone index that is currently on.
  // used to indicate the milestone progress bar at top
  public activeMilestoneIndex = 0;
  private highlightedActivityId: number;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public utils: UtilsService,
    public storage: BrowserStorageService,
    private projectService: ProjectService,
    private homeService: HomeService,
    private sharedService: SharedService,
    public fastFeedbackService: FastFeedbackService,
    private newRelic: NewRelicService,
    @Inject(DOCUMENT) private readonly document: Document
   ) {
    super(router);
  }

  private _initialise() {
    this.loadingMilestone = true;
  }

  onEnter() {
    this._initialise();
    this.newRelic.setPageViewName('Project View');
    this.route.queryParamMap.subscribe(params => {
      this.highlightedActivityId = +params.get('activityId') || undefined;
    });
    this.homeService.getProgramName().subscribe(
      programName => {
        this.programName = programName;
      },
      error => {
        this.newRelic.noticeError(error);
      }
    );

    this.subscriptions.push(this.projectService.getProject().subscribe(
      milestones => {
        if (!milestones) {
          milestones = [{ dummy: true }];
        }
        this.milestones = milestones;
        this.loadingMilestone = false;
        // scroll to highlighted activity if has one
        if (this.highlightedActivityId) {
          this.scrollTo(`activity-card-${this.highlightedActivityId}`);
        }
      },
      error => {
        this.newRelic.noticeError(error);
      }
    ));

    this.fastFeedbackService.pullFastFeedback().subscribe();
  }

  trackScrolling(event) {
    // get the position of each milestone
    const milestonePositions = this.milestoneRefs.map(milestoneRef => {
      return milestoneRef.nativeElement.offsetTop;
    });
    this.activeMilestoneIndex = milestonePositions.findIndex((element, i) => {
      const {
        detail, // current scrolling event
        srcElement // ion-content's height
      } = event;
      const screenMidPoint = detail.currentY + (srcElement.offsetHeight / 2);

      if (i === milestonePositions.length - 1) {
        return screenMidPoint >= element;
      }

      return screenMidPoint >= element && screenMidPoint < milestonePositions[i + 1];
    });
  }

  scrollTo(domId: string, index?: number): void {
    // update active milestone status (mark whatever user select)
    if (index > -1) {
      this.activeMilestoneIndex = index;
    }

    const el = this.document.getElementById(domId);
    if (el) {
      el.scrollIntoView({ block: 'start', behavior: 'smooth', inline: 'nearest' });
      el.classList.add('highlighted');
      setTimeout(() => el.classList.remove('highlighted'), 1000);
    }
  }

  goToActivity(id) {
    this.router.navigate(['app', 'activity', id]);
    this.newRelic.addPageAction('Navigate activity', id);
  }

}
