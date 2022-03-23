import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilsService } from '@v3/services/utils.service';
import { random } from 'lodash';
import { BehaviorSubject, interval, Observable, of, timer } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit {
  routeUrl = '/app/reviews';
  assessmentId: number;
  submissionId: number;
  contextId: number;

  currentAssessment: any;
  assessment: any;
  currentReview$ = new BehaviorSubject<any>({});
  reviews$ = new BehaviorSubject<any[]>([]);

  reviews = [
    {
      title: 'Final Report',
      icon: 'cog',
      submitter: 'John Doe',
      team: 'Team 1',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Final Report',
      icon: 'cog',
      submitter: 'Alys Harwood',
      team: 'Team 1',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Team Survey',
      icon: 'cog',
      submitter: 'John Doe',
      team: 'Team 1',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Feedback Loop',
      icon: 'cog',
      submitter: 'Tyreese Castillo',
      team: 'Team 3',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Test 1',
      icon: 'cog',
      submitter: 'submitter 1',
      team: 'Team 1',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Test 2',
      icon: 'cog',
      submitter: 'submitter 2',
      team: 'Team 2',
      status: 'pending',
      date: 'Feb',
    },
    {
      title: 'Test 3',
      icon: 'cog',
      submitter: 'submitter 3',
      team: 'Team 3',
      status: 'completed',
      date: 'Feb',
    },
  ];
  constructor(
    readonly utils: UtilsService,
    public router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.onEnter();
    interval(1000).pipe(take(10)).subscribe(x => {
      const result = parseFloat((Math.random() * x * 100).toFixed(0));
      this.currentReview$.next({
        something: (result % 2 == 0) ? true : false,
        value: result
      });
    });
    this.reviews$.next(this.reviews);
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  onEnter(): void {
    this.submissionId = +this.route.snapshot.paramMap.get('submissionId');
    // trigger onEnter after the element get generated
    /* setTimeout(() => {
      this.reviewList.onEnter();
    }); */
  }

  // display the review content in the right pane, and highlight on the left pane
  goto(event) {
    if (!event) {
      this.submissionId = null;
      return;
    }
    this.assessmentId = +event.assessmentId;
    this.submissionId = +event.submissionId;
    this.contextId = +event.contextId;
    // trigger onEnter after the element get generated
    /* setTimeout(() => {
      this.assessment.onEnter();
    }); */
  }

}
