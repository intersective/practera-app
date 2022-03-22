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
  @ViewChild('reviewList') reviewList;
  @ViewChild('assessment') assessment;

  currentReview$ = new BehaviorSubject<any>({});
  reviews$ = new BehaviorSubject<any[]>([]);

  reviews = [
    {
      title: 'Final Report',
      icon: 'cog',
      submitter: 'John Doe',
      team: 'Team 1',
      status: 'pending',
    },
    {
      title: 'Final Report',
      icon: 'cog',
      submitter: 'Alys Harwood',
      team: 'Team 1',
      status: 'pending',
    },
    {
      title: 'Team Survey',
      icon: 'cog',
      submitter: 'John Doe',
      team: 'Team 1',
      status: 'pending',
    },
    {
      title: 'Feedback Loop',
      icon: 'cog',
      submitter: 'Tyreese Castillo',
      team: 'Team 3',
      status: 'pending',
    },
    {
      title: 'Test 1',
      icon: 'cog',
      submitter: 'submitter 1',
      team: 'Team 1',
      status: 'pending',
    },
    {
      title: 'Test 2',
      icon: 'cog',
      submitter: 'submitter 2',
      team: 'Team 2',
      status: 'pending',
    },
    {
      title: 'Test 3',
      icon: 'cog',
      submitter: 'submitter 3',
      team: 'Team 3',
      status: 'completed'
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
