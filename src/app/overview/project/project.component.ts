import { Component, HostListener, ViewChild, ViewChildren, QueryList, ElementRef, Inject, Input, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService, Milestone } from './project.service';
import { UtilsService } from '@services/utils.service';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { NotificationService } from '@shared/notification/notification.service';
import { trigger, state, transition, style, animate, useAnimation } from '@angular/animations';
import { fadeIn } from '../../animations';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss'],
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('200ms ease-in-out', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in-out', style({transform: 'translateY(-100%)'}))
      ])
    ]),
    trigger('newLoad', [
      transition(':enter, * => 0, * => -1', [
        useAnimation(fadeIn, {
          params: { time: '250ms' }
        })
      ]),
    ])
  ]
})
export class ProjectComponent implements OnInit {
  @Input() refresh: Observable<any>;

  private showingMilestones: Array<Milestone | { id: number; }>;
  public programName: string;
  public milestones: Array<Milestone> = [];
  public loadingMilestone = true;
  @ViewChild('contentRef', {read: ElementRef}) contentRef: any;
  @ViewChildren('milestoneRef', {read: ElementRef}) milestoneRefs: QueryList<ElementRef>;
  // the milestone index that is currently on.
  // used to indicate the milestone progress bar at top
  public activeMilestoneIndex = 0;
  private highlightedActivityId: number;
  private activityCompleted: boolean;
  private subscriptions: Subscription[] = [];
  public isMobile: boolean;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public utils: UtilsService,
    private projectService: ProjectService,
    private platform: Platform,
    private newRelic: NewRelicService,
    private notificationService: NotificationService,
    @Inject(DOCUMENT) private readonly document: Document
   ) {
    this.showingMilestones = [];
    this.isMobile = this.utils.isMobile();
  }

  ngOnInit() {
    this.refresh.subscribe(params => {
      this.onEnter();
    });
  }

  private _initialise() {
    this.loadingMilestone = true;
  }

  onEnter() {
    this._initialise();
    this.newRelic.setPageViewName('Project View');
    this.route.queryParamMap.subscribe(params => {
      this.highlightedActivityId = +params.get('activityId') || undefined;
      this.activityCompleted = !!params.get('activityCompleted') || false;
    });

    this.subscriptions.push(this.projectService.getProject().subscribe(
      milestones => {
        if (!milestones) {
          return;
        }
        // don't need to do anything if data not changed
        if (JSON.parse(JSON.stringify(milestones)) === JSON.parse(JSON.stringify(this.milestones))) {
          return;
        }
        this.milestones = milestones;
        milestones.forEach(m => {
          if (m.progress !== 1) {
            this.showingMilestones.push(m);
          }
        });
        this.loadingMilestone = false;
        // scroll to highlighted activity if has one
        if (this.highlightedActivityId) {
          setTimeout(() => this.scrollTo(`activity-card-${this.highlightedActivityId}`), 1000);
        }
        // show activity complete toast message
        if (this.activityCompleted) {
          this.notificationService.presentToast(`&#127881; Congratulations. You've completed this activity.`, {
            position: 'bottom',
            color: 'primary',
            duration: 5000
          });
        }
      },
      error => {
        this.newRelic.noticeError(error);
      }
    ));

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

  toggleGroup(milestone: Milestone) {
    if (milestone.isLocked || (milestone.Activity && milestone.Activity.length === 0)) {
      return;
    }

    const indexFound = this.utils.findIndex(this.showingMilestones, ['id', milestone.id]);
    if (indexFound !== -1) {
      this.showingMilestones.splice(indexFound, 1);
    } else {
      this.showingMilestones.push(milestone);
    }
  }

  /**
   * @name isCollapsed
   * @description show and hide milestone in project view pane
   * @param {Milestone}
   */
  isCollapsed(milestone) {
    if (this.showingMilestones.length > 0) {
      const finding = this.showingMilestones.find(m => m.id === milestone.id);
      return finding === undefined;
    }
    return true;
  }

  goToActivity(id) {
    this.router.navigate(['app', 'activity', id]);
    this.newRelic.addPageAction('Navigate activity', id);
  }

}
